# Example

```js
// {{ TEMPLATE: }}
module.exports = {
  CUSTOM_PINNED_REPOS: {
    type: 'specificRepos',
    repos: [
      'vidl',
      'golang/go',
      'probablykasper/embler',
    ],
    modifyVariables: function(repo, moment, user) {
      repo.REPO_CREATED_MYDATE = moment(repo.REPO_CREATED_TIMESTAMP).format('YYYY MMMM Do')
      return repo
    },
  },
  "2_MOST_STARRED_REPOS": {
    type: 'repos',
    params: `
      first: 2,
      privacy: PUBLIC,
      ownerAffiliations:[OWNER],
      orderBy: { field:STARGAZERS, direction: DESC },
    `,
  },
  LATEST_VIDL_RELEASE: {
    type: 'customQuery',
    loop: false,
    query: async (octokit, moment, user) => {
      // You can do anything  you want with the GitHub API here.
      const result = await octokit.graphql(`
        query {
          repository(name: "vidl", owner: "${user.USERNAME}") {
            releases(last: 1) {
              edges {
                node {
                  url
                  publishedAt
                  tagName
                }
              }
            }
          }
        }
      `)
      const release = result.repository.releases.edges[0].node
      const date = new Date(release.publishedAt)
      // We have `loop: false`, so we return an object.
      // If we had `loop: true`, we would return an array of objects.
      return {
        VIDL_RELEASE_TAG: release.tagName,
        VIDL_RELEASE_URL: release.url,
        VIDL_RELEASE_WHEN: moment(release.publishedAt).fromNow(),
      }
    }
  }
}
// {{ :TEMPLATE }}
```

## latest vidl release (custom)

[vidl {{ VIDL_RELEASE_TAG }}]({{ VIDL_RELEASE_URL }}) ({{ VIDL_RELEASE_WHEN }})

## Specific repos (custom)

| ⭐️Stars   | 🗓Created | 📦Repo    | 📚Description |
| --------- | -------- | ----------- | -------------- |
{{ loop CUSTOM_PINNED_REPOS }}
| {{ REPO_STARS }} | {{ REPO_CREATED_MYDATE }} | [{{ REPO_FULL_NAME }}]({{ REPO_URL }}) | {{ REPO_DESCRIPTION }} |
{{ end CUSTOM_PINNED_REPOS }}

## 2 most starred repos list (custom)

{{ loop 2_MOST_STARRED_REPOS }}
⭐️ {{ REPO_STARS }} [{{ REPO_FULL_NAME }}]({{ REPO_URL }}): {{ REPO_DESCRIPTION }}

{{ end 2_MOST_STARRED_REPOS }}

## Me

- **USERNAME**: {{ USERNAME }}
- **NAME**: {{ NAME }}
- **EMAIL**: {{ EMAIL }}
- **USER_ID**: {{ USER_ID }}
- **BIO**: {{ BIO }}
- **COMPANY**: {{ COMPANY }}
- **LOCATION**: {{ LOCATION }}
- **TWITTER_USERNAME**: {{ TWITTER_USERNAME }}
- **AVATAR_URL**: {{ AVATAR_URL }}
- **WEBSITE_URL**: {{ WEBSITE_URL }}
- **SIGNUP_TIMESTAMP**: {{ SIGNUP_TIMESTAMP }}
  - **SIGNUP_DATE**: {{ SIGNUP_DATE }}
  - **SIGNUP_DATE2**: {{ SIGNUP_DATE2 }}
  - **SIGNUP_YEAR**: {{ SIGNUP_YEAR }}
  - **SIGNUP_AGO**: {{ SIGNUP_AGO }}
- **TOTAL_REPOS_SIZE_KB**: {{ TOTAL_REPOS_SIZE_KB }}
  - **TOTAL_REPOS_SIZE_MB**: {{ TOTAL_REPOS_SIZE_MB }}
  - **TOTAL_REPOS_SIZE_GB**: {{ TOTAL_REPOS_SIZE_GB }}
- **TOTAL_REPOSITORIES**: {{ TOTAL_REPOSITORIES }}

## Current Repository
{{ CURRENT_REPO_FULL_NAME }}

## 3 most starred repos

| ⭐️Stars   | 📦Repo    | 📚Description |
| --------- | ----------- | -------------- |
{{ loop 3_MOST_STARRED_REPOS }}
| {{ REPO_STARS }} | [{{ REPO_FULL_NAME }}]({{ REPO_URL }}) | {{ REPO_DESCRIPTION }} |
{{ end 3_MOST_STARRED_REPOS }}

## 3 newest repos list

| ⭐️Stars   | 📦Repo    | 📚Description |
| --------- | ----------- | -------------- |
{{ loop 3_NEWEST_REPOS }}
| {{ REPO_STARS }} | [{{ REPO_FULL_NAME }}]({{ REPO_URL }}) | {{ REPO_DESCRIPTION }} |
{{ end 3_NEWEST_REPOS }}

## 3 recently pushed repos

| ⭐️Stars   | 📦Repo    | 📚Description |
| --------- | ----------- | -------------- |
{{ loop 3_RECENTLY_PUSHED_REPOS }}
| {{ REPO_STARS }} | [{{ REPO_FULL_NAME }}]({{ REPO_URL }}) | {{ REPO_DESCRIPTION }} |
{{ end 3_RECENTLY_PUSHED_REPOS }}
