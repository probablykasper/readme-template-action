import * as core from '@actions/core'
import * as github from '@actions/github'
import * as moment from 'moment'

const ghToken = core.getInput('TOKEN', { required: true })
core.setSecret(ghToken)
export const octokit = github.getOctokit(ghToken)

export function getRepoFullName() {
  const repoFullName = process.env.GITHUB_REPOSITORY
  return {'REPO_FULL_NAME': repoFullName}
}

export function getRepoName() {
  const fullname = process.env.GITHUB_REPOSITORY ?? "";
  const repoName = fullname.split("/")[1];
  return { 'REPO_NAME': repoName };
}

export async function getUser() {
  const queryResult: any = await octokit.graphql(`
    query {
      viewer {
        USERNAME: login
        NAME: name
        EMAIL: email
        USER_ID: id
        BIO: bio
        COMPANY: company
        SIGNUP_TIMESTAMP: createdAt
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

  user.SIGNUP_DATE = moment(user.SIGNUP_TIMESTAMP).format('MMMM Do YYYY')
  user.SIGNUP_DATE2 = moment(user.SIGNUP_TIMESTAMP).format('YYYY-MM-DD')
  user.SIGNUP_YEAR = moment(user.SIGNUP_TIMESTAMP).format('YYYY')
  user.SIGNUP_AGO = moment(user.SIGNUP_TIMESTAMP).fromNow()
  user.TOTAL_REPOS_SIZE_KB = user.repositories.totalDiskUsage
  user.TOTAL_REPOS_SIZE_MB = Math.round(user.repositories.totalDiskUsage/1000*10)/10
  user.TOTAL_REPOS_SIZE_GB = Math.round(user.repositories.totalDiskUsage/1000/1000*100)/100
  user.TOTAL_REPOSITORIES = user.repositories.totalCount
  delete user.repositories

  return user
}

function fixRepoValues(repo) {

  repo.REPO_CREATED_DATE = moment(repo.REPO_CREATED_TIMESTAMP).format('MMMM Do YYYY')
  repo.REPO_CREATED_DATE2 = moment(repo.REPO_CREATED_TIMESTAMP).format('YYYY-MM-DD')
  repo.REPO_CREATED_YEAR = moment(repo.REPO_CREATED_TIMESTAMP).format('YYYY')
  repo.REPO_CREATED_AGO = moment(repo.REPO_CREATED_TIMESTAMP).fromNow()

  repo.REPO_PUSHED_DATE = moment(repo.REPO_PUSHED_TIMESTAMP).format('MMMM Do YYYY')
  repo.REPO_PUSHED_DATE2 = moment(repo.REPO_PUSHED_TIMESTAMP).format('YYYY-MM-DD')
  repo.REPO_PUSHED_YEAR = moment(repo.REPO_PUSHED_TIMESTAMP).format('YYYY')
  repo.REPO_PUSHED_AGO = moment(repo.REPO_PUSHED_TIMESTAMP).fromNow()

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

export async function getRepos(args) {

  const queryResult: any = await octokit.graphql(`
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
              REPO_CREATED_TIMESTAMP: createdAt
              REPO_PUSHED_TIMESTAMP: pushedAt
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

export async function getSpecificRepos(username, repoNames) {

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
        REPO_CREATED_TIMESTAMP: createdAt
        REPO_PUSHED_TIMESTAMP: pushedAt
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
  const queryResult = await octokit.graphql(`
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
