const core = require('@actions/core')
const github = require('@actions/github')

const ghToken = core.getInput('GITHUB_TOKEN')
const octokit = github.getOctokit(ghToken)

const graphqlQuery = async function(...args) {
  const queryResult = await octokit.graphql(...args)
  if (queryResult.errors) throw queryResult.errors
  return queryResult
}

module.exports.getUser = async function() {
  const queryResult = await graphqlQuery(`
    query {
      viewer {
        USERNAME: login
        NAME: name
        EMAIL: email
        USER_ID: id
        BIO: bio
        COMPANY: company
        SIGNUP_DATE: createdAt
        LOCATION: location
        TWITTER_USERNAME: twitterUsername
        AVATAR_URL: avatarUrl
        WEBSITE_URL: websiteUrl
        repositories {
          totalCount
          totalDiskUsage
        }
      }
    }
  `)

  const user = queryResult.viewer

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const userCreatedAt = new Date(user.SIGNUP_DATE)
  user.SIGNUP_YYYY = userCreatedAt.getFullYear()
  user.SIGNUP_M = userCreatedAt.getMonth() + 1
  user.SIGNUP_MMM = months[userCreatedAt.getMonth()].substring(0, 3)
  user.SIGNUP_MMMM = months[userCreatedAt.getMonth()]
  user.SIGNUP_D = userCreatedAt.getDate()
  user.SIGNUP_DO = userCreatedAt.getDate()
  if (user.SIGNUP_DO === 1) user.SIGNUP_DO += 'st'
  if (user.SIGNUP_DO === 2) user.SIGNUP_DO += 'nd'
  if (user.SIGNUP_DO === 3) user.SIGNUP_DO += 'rd'
  if (user.SIGNUP_DO === 4) user.SIGNUP_DO += 'th'
  user.TOTAL_REPOS_SIZE_KB = user.repositories.totalDiskUsage
  user.TOTAL_REPOS_SIZE_MB = Math.round(user.repositories.totalDiskUsage/1000*10)/10
  user.TOTAL_REPOS_SIZE_GB = Math.round(user.repositories.totalDiskUsage/1000/1000*100)/100
  user.TOTAL_REPOSITORIES = user.repositories.totalCount
  delete user.repositories

  return user
}

function fixRepoValues(repo) {
  repo.REPO_STARS = repo.stargazers.totalCount
  delete repo.stargazers
  if (repo.primaryLanguage) {
    repo.REPO_LANGUAGE = repo.primaryLanguage.name
  } else {
    repo.REPO_LANGUAGE = 'None'
  }
  delete repo.primaryLanguage
  repo.REPO_OWNER_USERNAME = repo.owner.login
  delete repo.owner
  repo.REPO_SIZE_KB = repo.diskUsage
  repo.REPO_SIZE_MB = Math.round(repo.diskUsage/1000*10)/10
  repo.REPO_SIZE_GB = Math.round(repo.diskUsage/1000/1000*100)/100
  delete repo.diskUsage
  return repo
}

module.exports.getRepos = async function(args) {

  const queryResult = await graphqlQuery(`
    query {
      viewer {
        repositories(${args}) {
          edges {
            node {
              REPO_NAME: name
              owner {
                login
              }
              REPO_FULL_NAME: nameWithOwner
              REPO_DESCRIPTION: description
              REPO_URL: url
              REPO_HOMEPAGE_URL: homepageUrl
              REPO_CREATED_DATE: createdAt
              REPO_PUSHED_DATE: pushedAt
              REPO_UPDATED_DATE: updatedAt
              diskUsage
              REPO_FORK_COUNT: forkCount
              REPO_ID: id
              stargazers {
                totalCount
              }
              primaryLanguage {
                name
              }
            }
          }
        }
      }
    }
  `)

  const repoEdges = queryResult.viewer.repositories.edges
  const repos = []
  for (const repoEdge of repoEdges) {
    let repo = repoEdge.node
    repo = fixRepoValues(repo)
    repos.push(repo)
  }
  return repos
  
}

module.exports.getSpecificRepos = async function(username, repoNames) {

  let repoQueryProperties = ''
  let index = -1
  for (let repoName of repoNames) {
    index += 1
    let repoOwner = ''
    if (repoName.includes('/')) {
      repoOwner = repoName.split('/')[0]
      repoName = repoName.split('/')[1]
    } else {
      repoOwner = username
    }

    repoQueryProperties += `
      repo${index}: repository(owner: "${repoOwner}" name: "${repoName}") {
        REPO_NAME: name
        owner {
          login
        }
        REPO_FULL_NAME: nameWithOwner
        REPO_DESCRIPTION: description
        REPO_URL: url
        REPO_HOMEPAGE_URL: homepageUrl
        REPO_CREATED_DATE: createdAt
        REPO_PUSHED_DATE: pushedAt
        REPO_UPDATED_DATE: updatedAt
        REPO_FORK_COUNT: forkCount
        REPO_ID: id
        diskUsage
        stargazers {
          totalCount
        }
        primaryLanguage {
          name
        }
      }
    `
  }
  const queryResult = await graphqlQuery(`
    query {
      ${repoQueryProperties}
    }
  `)
  let repos = []
  for (let i = 0; i !== null; i++) {
    let repo = queryResult['repo'+i]
    if (!repo) break
    repo = fixRepoValues(repo)
    repos.push(repo)
  }
  return repos
}
