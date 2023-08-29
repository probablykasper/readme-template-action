import * as core from '@actions/core'
import * as fs from 'fs'
import * as moment from 'moment'
import * as queries from './queries'
import {
  trimRightChar,
  deleteFirstLine,
  deleteLastLine,
} from './utils'

// parses first found only
function parseBlock(str, openStr, closeStr) {
  const openIndex = str.indexOf(openStr)
  const endIndex = str.indexOf(closeStr)
  if (openIndex < 0 || endIndex < 0) return null

  let beforeBlock = str.substring(0, openIndex)
  beforeBlock = trimRightChar(beforeBlock, ' ')
  if (beforeBlock.endsWith('\n')) {
    beforeBlock = beforeBlock.substring(0, beforeBlock.length - 1)
  }
  let block = str.substring(openIndex+openStr.length, endIndex)
  block = trimRightChar(block, ' ')
  if (block.endsWith('\n')) {
    block = block.substring(0, block.length - 1)
  }
  let afterBlock = str.substring(endIndex+closeStr.length)
  return { beforeBlock, block, afterBlock }
}

type Moment = typeof moment
type CustomTemplate = {
  [name: string]: {
    type: string
    repos?: string[]
    params?: string
    modifyVariables?: (repo: any, moment: Moment, user: any) => any
    loop?: boolean
    query?: (octokit: any, moment: Moment, user: any) => any
  }
}
function getCustomTemplate(str) {
  const parsed = parseBlock(str, '// {{ TEMPLATE: }}', '// {{ :TEMPLATE }}')
  if (!parsed) return { customTemplate: {}, outputStr: str }
  parsed.beforeBlock = deleteLastLine(parsed.beforeBlock)
  parsed.afterBlock = deleteFirstLine(parsed.afterBlock)

  const requireFromString = require('require-from-string')
  const parsedCustomTemplate: CustomTemplate = requireFromString(parsed.block)

  return {
    customTemplate: parsedCustomTemplate,
    outputStr: parsed.beforeBlock + parsed.afterBlock,
  }

}

function inject(str, values) {
  for (const [key, value] of Object.entries(values)) {
    const valueStr = '{{ '+key+' }}'
    str = str.split(valueStr).join(value)
  }
  return str
}

async function injectLoop(str, name, valuesListArg) {
  const parsed = parseBlock(str, `{{ loop ${name} }}`, `{{ end ${name} }}`)
  if (!parsed) return str
  let valuesList = valuesListArg
  if (typeof valuesListArg === 'function') valuesList = await valuesListArg()
  let newBlock = ''
  for (const values of valuesList) {
    newBlock += inject(parsed.block, values)
  }
  return parsed.beforeBlock + newBlock + await injectLoop(parsed.afterBlock, name, valuesList)
}

run()
async function run() {
  try {

    let templatePath = core.getInput('TEMPLATE', { required: true })
    console.log('Template:', templatePath)
    if (!fs.existsSync(templatePath)) throw 'Template file not found'
    const templateFile = fs.readFileSync(templatePath).toString()

    let outputPath = core.getInput('OUTPUT', { required: true })
    console.log('output:', outputPath)

    let { customTemplate, outputStr } = getCustomTemplate(templateFile)

    console.log('User data')
    console.log('    - Fetching')
    const user = await queries.getUser()
    console.log('    - Injecting')
    outputStr = inject(outputStr, user)

    console.log('Repository full Name')
    console.log('    - Fetching')
    const repoFullName = queries.getRepoFullName()
    console.log('    - Injecting')
    outputStr = inject(outputStr, repoFullName)

    console.log('Repository Name')
    console.log('    - Fetching')
    const repoName = queries.getRepoName()
    console.log('    - Injecting')
    outputStr = inject(outputStr, repoName)

    if (!customTemplate['3_MOST_STARRED_REPOS']) {
      customTemplate['3_MOST_STARRED_REPOS'] = {
        type: 'repos',
        params: `
          first: 3,
          privacy: PUBLIC,
          ownerAffiliations:[OWNER],
          orderBy: { field:STARGAZERS, direction: DESC }
        `
      }
    }
    if (!customTemplate['3_NEWEST_REPOS']) {
      customTemplate['3_NEWEST_REPOS'] = {
        type: 'repos',
        params: `
          first: 3,
          privacy: PUBLIC,
          ownerAffiliations:[OWNER],
          orderBy: { field:CREATED_AT, direction: DESC }
        `
      }
    }
    if (!customTemplate['3_RECENTLY_PUSHED_REPOS']) {
      customTemplate['3_RECENTLY_PUSHED_REPOS'] = {
        type: 'repos',
        params: `
          first: 3,
          privacy: PUBLIC,
          ownerAffiliations:[OWNER],
          orderBy: { field:PUSHED_AT, direction: DESC }
        `
      }
    }

    for (const [templateName, template] of Object.entries(customTemplate)) {
      if (template.type === 'repos' || template.type === 'specificRepos') {

        console.log(templateName)
        console.log('    - Looking for')
        outputStr = await injectLoop(outputStr, templateName, async () => {
          console.log('    - Fetching')
          const repos = template.type === 'repos'
            ? await queries.getRepos(template.params)
            : await queries.getSpecificRepos(user.USERNAME, template.repos)
          if (typeof template.modifyVariables === 'function') {
            for (let i = 0; i < repos.length; i++) {
              repos[i] = template.modifyVariables(repos[i], moment, user)
            }
          }
          console.log('    - Injecting')
          return repos
        })

      } else if (template.type === 'customQuery') {

        console.log(templateName, '(customQuery)')
        if (template.loop) {
          console.log('    - Looking for')
          outputStr = await injectLoop(outputStr, templateName, async () => {
            console.log('    - Fetching')
            const resultArray = await template.query(queries.octokit, moment, user)
            console.log('    - Injecting')
            return resultArray
          })
        } else {
          console.log('    - Fetching')
          const resultObject = await template.query(queries.octokit, moment, user)
          console.log('    - Injecting')
          outputStr = inject(outputStr, resultObject)
        }
        
      } else if (template.type) {
        throw new Error(`Invalid template type "${template.type}"`)
      }
    }

    fs.writeFileSync(outputPath, outputStr)

  } catch (error) {
    console.log(error)
    if (typeof error === 'string') {
      core.setFailed(error)
    } else {
      core.setFailed(error.message)
    }
  }
}
