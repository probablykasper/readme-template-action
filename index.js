const core = require('@actions/core')
const fs = require('fs')
const queries = require('./src/queries.js')
const {
  newErr,
  trimRightChar, 
  deleteFirstLine,
  deleteLastLine,
} = require('./src/utils.js')

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

function getCustomTemplate(str) {
  const parsed = parseBlock(str, '// {{ TEMPLATE: }}', '// {{ :TEMPLATE }}')
  if (!parsed) return {}
  parsed.beforeBlock = deleteLastLine(parsed.beforeBlock)
  parsed.afterBlock = deleteFirstLine(parsed.afterBlock)

  const requireFromString = require('require-from-string')
  const parsedCustomTemplate = requireFromString(parsed.block)

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

    let templatePath = core.getInput('TEMPLATE')
    console.log('template:', templatePath)
    if (!fs.existsSync(templatePath)) throw newErr('Template file not found')
    const templateFile = fs.readFileSync(templatePath).toString()

    let outputPath = core.getInput('OUTPUT')
    console.log('output:', outputPath)

    let { customTemplate, outputStr } = getCustomTemplate(templateFile)

    console.log('User data: Fetching')
    const user = await queries.getUser()
    console.log('User data: Injecting')
    outputStr = inject(outputStr, user)

    // console.log('Searching for 3_MOST_STARRED_REPOS')
    // outputStr = await injectLoop(outputStr, '3_MOST_STARRED_REPOS', async () => {
    //   console.log('3_MOST_STARRED_REPOS: Fetching')
    //   const starredRepos = await queries.getRepos(`
    //     first: 3,
    //     privacy: PUBLIC,
    //     ownerAffiliations:[OWNER],
    //     orderBy: { field:STARGAZERS, direction: DESC }
    //   `)
    //   console.log('3_MOST_STARRED_REPOS: Injecting')
    //   return starredRepos
    // })
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

    for (const [templateName, template] of Object.entries(customTemplate)) {
      if (template.type === 'repos' || template.type === 'specificRepos') {

        console.log(templateName+': Fetching')
        const repos = template.type === 'repos'
          ? await queries.getRepos(template.params)
          : await queries.getSpecificRepos(user.USERNAME, template.repos)
        if (typeof template.modifyVariables === 'function') {
          for (let i = 0; i < repos.length; i++) {
            repos[i] = template.modifyVariables(repos[i])
          }
        }
        console.log(templateName+': Injecting')
        outputStr = await injectLoop(outputStr, templateName, repos)

      } else {
        throw new Error(`Invalid template type "${template.type}"`)
      }
    }

    fs.writeFileSync(outputPath, outputStr)

  } catch (error) {
    if (!error || !error.logMessageOnly) {
      console.log(error)
    }
    core.setFailed(error.message)
  }
}
