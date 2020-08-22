# Test

```js
// {{ TEMPLATE: }}
module.exports = {
  MOST_STARRED_REPOS: {
    type: 'repos',
    params: 'first: 5, orderBy: { field:STARGAZERS, direction: DESC }, privacy: PUBLIC',
  },
  CUSTOM_PINNED_REPOS: {
    type: 'specificRepos',
    repos: [
      'vidl',
      'golang/go',
      'probablykasper/embler',
    ],
    modifyVariables: function(repo) {
      repo.CREATED_YYYY = new Date(repo.CREATED_DATE).getFullYear()
      return repo
    },
  },
}
// {{ :TEMPLATE }}
```

| Stars       | Name       | Description       |
| ----------- | ---------- | ----------------- |
{{ loop CUSTOM_PINNED_REPOS }}
| {{ REPO_STARS }} | {{ REPO_OWNER_USERNAME }} | {{ REPO_DESCRIPTION }} |
{{ end }}

- USERNAME: {{ USERNAME }}
- NAME: {{ NAME }}
- EMAIL: {{ EMAIL }}
- USER_ID: {{ USER_ID }}
- BIO: {{ BIO }}
- COMPANY: {{ COMPANY }}
- LOCATION: {{ LOCATION }}
- TWITTER_USERNAME: {{ TWITTER_USERNAME }}
- AVATAR_URL: {{ AVATAR_URL }}
- WEBSITE_URL: {{ WEBSITE_URL }}
- SIGNUP_DATE: {{ SIGNUP_DATE }}
  - SIGNUP_YYYY: {{ SIGNUP_YYYY }}
  - SIGNUP_M: {{ SIGNUP_M }}
  - SIGNUP_MMM: {{ SIGNUP_MMM }}
  - SIGNUP_MMMM: {{ SIGNUP_MMMM }}
  - SIGNUP_D: {{ SIGNUP_D }}
  - SIGNUP_DO: {{ SIGNUP_DO }}

Signed up {{ SIGNUP_MMMM }} {{ SIGNUP_DO }}, {{ SIGNUP_YYYY }}

|Stars|Name|Description|
|---|---|---|
{{ loop MOST_STARRED_REPOS }}
| {{ REPO_STARS }} | {{ NAME }} | {{ REPO_DESCRIPTION }} |
{{ end }}
