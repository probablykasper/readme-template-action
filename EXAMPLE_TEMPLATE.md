# Example

```js
// {{ TEMPLATE: }}
module.exports = {
    "2_MOST_STARRED_REPOS": {
        type: 'repos',
        params: `
            first: 2,
            privacy: PUBLIC,
            ownerAffiliations:[OWNER],
            orderBy: { field:STARGAZERS, direction: DESC },
        `,
    },
    CUSTOM_PINNED_REPOS: {
        type: 'specificRepos',
        repos: [
            'vidl',
            'golang/go',
            'probablykasper/embler',
        ],
        modifyVariables: function(repo) {
            repo.REPO_CREATED_YYYY = new Date(repo.REPO_CREATED_DATE).getFullYear()
            return repo
        },
    },
}
// {{ :TEMPLATE }}
```

## Specific repos (custom)

| ⭐️Stars   | 🗓Created | 📦Repo    | 📚Description |
| --------- | -------- | ----------- | -------------- |
{{ loop CUSTOM_PINNED_REPOS }}
| {{ REPO_STARS }} | {{ REPO_CREATED_DATE }} | [{{ REPO_FULL_NAME }}]({{ REPO_URL }}) | {{ REPO_DESCRIPTION }} |
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
- **SIGNUP_DATE**: {{ SIGNUP_DATE }}
- **SIGNUP_YYYY**: {{ SIGNUP_YYYY }}
  - **SIGNUP_M**: {{ SIGNUP_M }}
  - **SIGNUP_MMM**: {{ SIGNUP_MMM }}
  - **SIGNUP_MMMM**: {{ SIGNUP_MMMM }}
  - **SIGNUP_D**: {{ SIGNUP_D }}
  - **SIGNUP_DO**: {{ SIGNUP_DO }}
- **TOTAL_REPOS_SIZE_KB**: {{ TOTAL_REPOS_SIZE_KB }}
  - **TOTAL_REPOS_SIZE_MB**: {{ TOTAL_REPOS_SIZE_MB }}
  - **TOTAL_REPOS_SIZE_GB**: {{ TOTAL_REPOS_SIZE_GB }}
- **TOTAL_REPOSITORIES**: {{ TOTAL_REPOSITORIES }}

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
