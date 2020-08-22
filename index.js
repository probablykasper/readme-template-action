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
  beforeBlock = trimRightChar(beforeBlock, '\n')
  let block = str.substring(openIndex+openStr.length, endIndex)
  block = trimRightChar(block, ' ')
  block = trimRightChar(block, '\n')
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

function injectLoop(str, name, valuesList) {
  const parsed = parseBlock(str, `{{ loop ${name} }}`, '{{ end }}')
  if (!parsed) return str
  let newBlock = ''
  for (const values of valuesList) {
    newBlock += inject(parsed.block, values)
  }
  return parsed.beforeBlock + newBlock + parsed.afterBlock
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

    console.log('Fetching user data')
    const user = await queries.getUser()
    console.log('Injecting user data')
    outputStr = inject(outputStr, user)
    console.log(user)

    console.log('Fetching 5 most starred repos')
    const starredRepos = await queries.getRepos(`
      first: 100,
      privacy: PUBLIC,
      orderBy: { field:STARGAZERS, direction: DESC }
    `)
    outputStr = injectLoop(outputStr, starredRepos)

    for (const [templateName, template] of Object.entries(customTemplate)) {
      if (template.type === 'specificRepos') {
        console.log('Fetching', templateName)
        const repos = await queries.getSpecificRepos(user.USERNAME, template.repos)
        for (let i = 0; i < repos.length; i++) {
          repos[i] = template.modifyVariables(repos[i])
        }

        console.log('Injecting', templateName)
        outputStr = injectLoop(outputStr, templateName, repos)
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
