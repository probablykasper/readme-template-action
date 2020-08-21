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

## Example workflow
```
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

## Dev instructions

### Test offline
First, to get started:
1. Install [Node.js](https://nodejs.org/)
2. Run `npm install`
3. [Go here](https://github.com/settings/tokens/new?scopes=read:user) to generate a GitHub personal access token with the `read:user` scope.
4. Create a `.env` file contianing the token:
```
INPUT_GITHUB_TOKEN=mytoken
```

Now you can test the action by running the following command:
```
npm run test
```
