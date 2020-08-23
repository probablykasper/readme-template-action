# README Template

Add GitHub data to your `README.md`, or any other file.

A GitHub action that provides template strings that are replaced with their respective values when the action runs.

By default, it takes `TEMPLATE.md` and outputs `README.md`.

## Inputs

| name         | type   | default         | description |
| ------------ | ------ | --------------- | ----------- |
| github_token | string |                 | GitHub personal access token used to fetch data. Can be passed using `${{ secrets.GITHUB_TOKEN }}`. [Go here](https://github.com/settings/tokens/new?scopes=read:user) to generate one with the `read:user` scope
| template     | string | `"TEMPLATE.md"` | Template file path
| readme       | string | `"README.md"`   | Output file path

## Example usage

Check out [`EXAMPLE_TEMPLATE.md`](./EXAMPLE_TEMPLATE.md) and [`EXAMPLE_OUTPUT.md`](./EXAMPLE_TEMPLATE.md) for more examples and their outputs.

Workflow:

```yml
on:
    schedule:
        - cron: '0 */2 * * *' # every 2 hours
    push:
        branchesL
            - master
jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
        with:
          fetch-depth: 0
      - name: Generate README.md
        uses: probablykasper/readme-template
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
      - name: Update README.md
        run: |
          if [[ "$(git status --porcelain)" != "" ]]; then
            git config user.name "GitHub Action"
            git config user.email "action@github.com"
            git add .
            git commit -m "Update README"
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

| Variable                  | Example |
| ------------------------- | ------- |
| {{ USERNAME }}            | probablykasper |
| {{ NAME }}                | Kasper |
| {{ EMAIL }}               | email@example.com |
| {{ USER_ID }}             | MDQ6VXNlcjExMzE1NDky |
| {{ BIO }}                 | Fullstack developer from Norway |
| {{ COMPANY }}             | Microscopicsoft |
| {{ SIGNUP_DATE }}         | 2015-03-04T14:48:35Z |
| {{ LOCATION }}            | Norway |
| {{ TWITTER_USERNAME }}    | probablykasper |
| {{ AVATAR_URL }}          | https://avatars0.githubusercontent.com/u/11315492u=c501da00e9b817ffc78faab6c630f236ac2738cf&v=4 |
| {{ WEBSITE_URL }}         | https://kasper.space/ |
| {{ SIGNUP_YYYY }}         | 2015 |
| {{ SIGNUP_M }}            | 3 |
| {{ SIGNUP_MMM }}          | Mar |
| {{ SIGNUP_MMMM }}         | March |
| {{ SIGNUP_D }}            | 4 |
| {{ SIGNUP_DO }}           | 4th |
| {{ TOTAL_REPOS_SIZE_KB }} | 707403 |
| {{ TOTAL_REPOS_SIZE_MB }} | 707.4 |
| {{ TOTAL_REPOS_SIZE_GB }} | 0.71 |
| {{ TOTAL_REPOSITORIES }}  | 70740 |

### Variables you can put inside `repo` loops

| Variable                  | Example |
| ------------------------- | ------- |
| {{ REPO_NAME }}           | cpc
| {{ REPO_FULL_NAME }}      | probablykasper/cpc
| {{ REPO_OWNER_USERNAME }} | probablykasper
| {{ REPO_DESCRIPTION }}    | Text calculator with support for units and conversion |
| {{ REPO_URL }}            | https://github.com/probablykasper/cpc
| {{ REPO_HOMEPAGE_URL }}   | https://rust-lang.org/
| {{ REPO_CREATED_DATE }}   | 2019-12-05T22:45:04Z
| {{ REPO_PUSHED_DATE }}    | 2020-08-20T20:13:22Z
| {{ REPO_UPDATED_DATE }}   | 2020-08-20T20:13:25Z
| {{ REPO_FORK_COUNT }}     | 0
| {{ REPO_ID }}             | MDEwOlJlcG9zaXRvcnkyMjYyMDE5NTU=
| {{ REPO_STARS }}          | 0
| {{ REPO_LANGUAGE }}       | Rust
| {{ REPO_SIZE_KB }}        | 1268285
| {{ REPO_SIZE_MB }}        | 1268.3
| {{ REPO_SIZE_GB }}        | 1.27

## Loops

These are the built-in loops you can use:

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
            <td><code>3_NEWEST_REPOS</code></td>
            <td>repos</td>
            <td>
                Fetches your 3 most starred repos.
                Uses the following parameters:
                <pre>first: 3,<br>privacy: PUBLIC,<br>ownerAffiliations:[OWNER],<br>orderBy: { field:CREATED_AT, direction: DESC }</pre>
            </td>
            <td><code>3_RECENTLY_PUSHED_REPOS</code></td>
            <td>repos</td>
            <td>
                Fetches your 3 most starred repos.
                Uses the following parameters:
                <pre>first: 3,<br>privacy: PUBLIC,<br>ownerAffiliations:[OWNER],<br>orderBy: { field:PUSHED_AT, direction: DESC }</pre>
            </td>
        </tr>
        <tr>
            <td><code>Loop</code></td>
            <td>Type</td>
            <td>Description</td>
        </tr>
    </tbody>
</table>

## Advanced usage

If you want to show less starred repos,

## Dev instructions

### Test offline

First, to get started:

1. Install [Node.js](https://nodejs.org/)
2. Run `npm install`
3. [Go here](https://github.com/settings/tokens/new?scopes=read:user) to generate a GitHub personal access token with the `read:user` scope.
4. Create a `.env` file contianing the token:

```env
INPUT_GITHUB_TOKEN=mytoken
```

Now you can test the action by running the following command:

```sh
npm run test
```
