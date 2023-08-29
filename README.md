# README Template

Add GitHub data to your `README.md`, or any other file.

A GitHub action that provides template strings that are replaced with their respective values when the action runs.

By default, it takes `TEMPLATE.md` and outputs `README.md`.

## Inputs

| name         | required | type   | default         | description |
| ------------ | ---      | ------ | --------------- | ----------- |
| token        | yes      | string |                 | GitHub personal access token used to fetch data. Pass a secret by for instance using `${{ secrets.README_TEMPLATE_TOKEN }}`. [Go here](https://github.com/settings/tokens/new?scopes=read:user) to generate one with the `read:user` scope
| template     | yes      | string | `"TEMPLATE.md"` | Template file path
| readme       | yes      | string | `"README.md"`   | Output file path

## Example usage

Check out [`EXAMPLE_TEMPLATE.md`](./EXAMPLE_TEMPLATE.md) and [`EXAMPLE_OUTPUT.md`](./EXAMPLE_OUTPUT.md) for more examples and their outputs.

Workflow:

```yml
name: Readme Template
on:
  schedule:
    - cron: '0 */2 * * *' # every 2 hours
  push:
    branches: [ master ]
jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
      with:
        fetch-depth: 0
    - name: Generate README.md
      uses: probablykasper/readme-template-action@v1
      with:
        token: ${{ secrets.README_TEMPLATE_TOKEN }}
        template: TEMPLATE.md
        output: README.md
    - name: Update README.md
      run: |
        if [[ "$(git status --porcelain)" != "" ]]; then
          git config user.name "GitHub Action"
          git config user.email "action@github.com"
          git add .
          git commit -m "Auto-update README.md"
          git push
        fi
```

`TEMPLATE.md`:

````markdown
My most starred repos:
| ⭐️Stars   | 📦Repo    | 📚Description |
| --------- | ----------- | -------------- |
{{ loop 3_MOST_STARRED_REPOS }}
| {{ REPO_STARS }} | [{{ REPO_FULL_NAME }}]({{ REPO_URL }}) | {{ REPO_DESCRIPTION }} |
{{ end 3_MOST_STARRED_REPOS }}
````

This generates the following output in my case:

My most starred repos:

| ⭐️Stars   | 📦Repo    | 📚Description |
| --------- | ----------- | -------------- |
| 10 | [probablykasper/chester-syntax](https://github.com/probablykasper/chester-syntax) | A pretty Atom syntax theme based on Lonely Planet colours |
| 4 | [probablykasper/homebrew-tap](https://github.com/probablykasper/homebrew-tap) | My Homebrew casks and formulas |
| 2 | [probablykasper/cryp](https://github.com/probablykasper/cryp) | Cryptocurrency portfolio tracker |
| 1 | [probablykasper/notifier](https://github.com/probablykasper/notifier) | Flutter app for scheduling notifications |
| 1 | [probablykasper/colorboy](https://github.com/probablykasper/colorboy) | Easy terminal coloring for Node.js, macOS/Linux |

## Variables

### Normal variables you can put into your template file

| Variable                 | Example |
| ------------------------ | ------- |
| {{ USERNAME }}            | probablykasper
| {{ NAME }}                | Kasper
| {{ EMAIL }}               | email@example.com
| {{ USER_ID }}             | MDQ6VXNlcjExMzE1NDky
| {{ BIO }}                 | Fullstack developer from Norway
| {{ COMPANY }}             | Microscopicsoft
| {{ LOCATION }}            | Norway
| {{ TWITTER_USERNAME }}    | probablykasper
| {{ AVATAR_URL }}          | https://avatars0.githubusercontent.com/u/11315492?u=c501da00e9b817ffc78faab6c630f236ac2738cf&v=4
| {{ WEBSITE_URL }}         | https://kasper.space/
| {{ SIGNUP_TIMESTAMP }}    | 2015-03-04T14:48:35Z
| {{ SIGNUP_DATE }}         | March 4th 2015
| {{ SIGNUP_DATE2 }}        | 2015-03-04
| {{ SIGNUP_YEAR }}         | 2015
| {{ SIGNUP_AGO }}          | 5 years ago
| {{ TOTAL_REPOS_SIZE_KB }} | 707453
| {{ TOTAL_REPOS_SIZE_MB }} | 707.5
| {{ TOTAL_REPOS_SIZE_GB }} | 0.71
| {{ TOTAL_REPOSITORIES }}  | 46
| {{ REPO_FULL_NAME }}      | probablykasper/readme-template-action
| {{ REPO_NAME }}           | readme-template-action

### Variables you can put inside `repo` loops

| Variable                     | Example |
| ---------------------------- | ------- |
| {{ REPO_NAME }}              | cpc
| {{ REPO_FULL_NAME }}         | probablykasper/cpc
| {{ REPO_DESCRIPTION }}       | Text calculator with support for units and conversion
| {{ REPO_URL }}               | https://github.com/probablykasper/cpc
| {{ REPO_HOMEPAGE_URL }}      | https://rust-lang.org/
| {{ REPO_CREATED_TIMESTAMP }} | 2019-12-05T22:45:04Z
| {{ REPO_PUSHED_TIMESTAMP }}  | 2020-08-20T20:13:22Z
| {{ REPO_FORK_COUNT }}        | 2
| {{ REPO_ID }}                | MDEwOlJlcG9zaXRvcnkyMjYyMDE5NTU=
| {{ REPO_CREATED_DATE }}      | December 5th 2019
| {{ REPO_CREATED_DATE2 }}     | 2019-12-05
| {{ REPO_CREATED_YEAR }}      | 2019
| {{ REPO_CREATED_AGO }}       | 9 months ago
| {{ REPO_PUSHED_DATE }}       | August 20th 2020
| {{ REPO_PUSHED_DATE2 }}      | 2020-08-20
| {{ REPO_PUSHED_YEAR }}       | 2020
| {{ REPO_PUSHED_AGO }}        | 3 days ago
| {{ REPO_STARS }}             | 5
| {{ REPO_LANGUAGE }}          | Rust
| {{ REPO_OWNER_USERNAME }}    | probablykasper
| {{ REPO_SIZE_KB }}           | 1268285
| {{ REPO_SIZE_MB }}           | 1268.3
| {{ REPO_SIZE_GB }}           | 1.27

## Loops

These are the built-in loops you can use. Data is only fetched for loops you use.

<table>
    <thead>
        <tr>
            <td>Loop</td>
            <td>Type</td>
            <td>Description</td>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td><code>3_MOST_STARRED_REPOS</code></td>
            <td>repos</td>
            <td>
                Fetches your 3 most starred repos.
                Uses the following parameters:
                <pre>first: 3,<br>privacy: PUBLIC,<br>ownerAffiliations:[OWNER],<br>orderBy: { field:STARGAZERS, direction: DESC }</pre>
            </td>
      </tr>
      <tr>
            <td><code>3_NEWEST_REPOS</code></td>
            <td>repos</td>
            <td>
                Fetches your 3 most starred repos.
                Uses the following parameters:
                <pre>first: 3,<br>privacy: PUBLIC,<br>ownerAffiliations:[OWNER],<br>orderBy: { field:CREATED_AT, direction: DESC }</pre>
            </td>
        </tr>
        <tr>
            <td><code>3_RECENTLY_PUSHED_REPOS</code></td>
            <td>repos</td>
            <td>
                Fetches your 3 most starred repos.
                Uses the following parameters:
                <pre>first: 3,<br>privacy: PUBLIC,<br>ownerAffiliations:[OWNER],<br>orderBy: { field:PUSHED_AT, direction: DESC }</pre>
            </td>
        </tr>
    </tbody>
</table>

## Advanced usage

Check out [`EXAMPLE_TEMPLATE.md`](./EXAMPLE_TEMPLATE.md) and [`EXAMPLE_OUTPUT.md`](./EXAMPLE_OUTPUT.md) to see examples and their outputs.

For advanced usage, add a code block like this to your template:

````markdown
```js
// {{ TEMPLATE: }}
module.exports = {
    // ... custom vairables/loops
}
// {{ :TEMPLATE }}
````

### List specific repos
Get a list of specific repos

```js
  CUSTOM_PINNED_REPOS: {
    type: 'specificRepos',
    repos: [ 'vidl', 'golang/go', 'probablykasper/embler' ],
  },
```

### Repos with custom parameters
Get repos using custom parameters:

```js
  "2_MOST_STARRED_REPOS": {
    type: 'repos',
    params: `
      first: 2,
      privacy: PUBLIC,
      ownerAffiliations:[OWNER],
      orderBy: { field:STARGAZERS, direction: DESC },
    `,
  },
```

### Modify variables
Add a `modifyVariables` function to overwrite/add variables:

```js
  CUSTOM_PINNED_REPOS: {
    type: 'specificRepos',
    repos: [ 'vidl' ],
    modifyVariables: function(repo, moment, user) {
      repo.REPO_CREATED_MYDATE = moment(repo.REPO_CREATED_TIMESTAMP).format('YYYY MMMM Do')
      return repo
    },
  },
```

### Custom queries

```js
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
```

## Dev instructions

First, to get started:

1. Install [Node.js](https://nodejs.org/)
2. Run `npm install`
3. [Go here](https://github.com/settings/tokens/new?scopes=read:user) to generate a GitHub personal access token with the `read:user` scope.
4. Create a `.env` file like this, with your token:

```env
INPUT_TOKEN=mytoken
INPUT_TEMPLATE=EXAMPLE_TEMPLATE.md
INPUT_OUTPUT=EXAMPLE_OUTPUT.md
```

Now you can test the action by running the following command:

```sh
npm run test
```

Build:
```sh
npm run build
```
