const core = require('@actions/core');
const github = require('@actions/github');
const path = require('path')
const fs = require('fs')
const process = require('process')

run()
async function run() {
  try {

    let templateInput = core.getInput('TEMPLATE')
    console.log('template:', templateInput)
    const templatePath = path.resolve(templateInput);

    let outputInput = core.getInput('OUTPUT');
    console.log('output:', outputInput)
    const outputPath = path.resolve(outputInput);

    const ghToken = core.getInput('GITHUB_TOKEN');
    const octokit = github.getOctokit(ghToken);

    function trimRightChar(string, charToRemove) {
        // while(string.charAt(0)==charToRemove) {
        //     string = string.substring(1);
        // }
        while(string.charAt(string.length-1)==charToRemove) {
            string = string.substring(0,string.length-1);
        }
        return string;
    }

    function inject(str, name, valueList) {
      const startStr = '{{ '+name+': }}';
      const startIndex = str.indexOf(startStr);
      const endStr = '{{ /'+name+' }}';
      const endIndex = str.indexOf(endStr);
      if (startIndex >= 0 && endIndex >= 0) {
        let beforeLoop = str.substring(0, startIndex);
        beforeLoop = trimRightChar(beforeLoop, ' ');
        beforeLoop = trimRightChar(beforeLoop, '\n');
        let loopContent = str.substring(startIndex+startStr.length, endIndex);
        loopContent = trimRightChar(loopContent, ' ');
        loopContent = trimRightChar(loopContent, '\n');
        let newLoopContent = ''
        const afterLoop = str.substring(endIndex+endStr.length);
        // loop through array
        for (const value of valueList) {
          // loop through value object
          let newNewLoopContent = loopContent
          for (const key in value) {
            if (!value.hasOwnProperty(key)) return;
            const valueStr = '{{ '+key+' }}';
            newNewLoopContent = newNewLoopContent.split(valueStr).join(value[key]);
          }
          newLoopContent += newNewLoopContent
        }
        return beforeLoop + newLoopContent + inject(afterLoop, name, valueList);
      } else {
        return str;
      }
    }

    const templateFile = fs.readFileSync(templatePath).toString();
    const result = inject(templateFile, 'REPOSITORIES', [
      {
        NAME: 'cpc',
        STARS: 2,
        DESCRIPTION: 'calculaton + conversion',
      },
      {
        NAME: 'vidl',
        STARS: 5,
        DESCRIPTION: 'youtube video downloader',
      },
    ]);

    fs.writeFileSync(outputPath, result)

  } catch (error) {
    console.log(error)
    core.setFailed(error.message);
  }
}
