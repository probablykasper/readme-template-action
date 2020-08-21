# README Template

Add GitHub data to your `README.md`, Or any other file.

A GitHub action that provides template strings that are replaced with their respective values when the action runs.

By default, it takes `TEMPLATE.md` and outputs `README.md`.

## Inputs

### `template`

**Required** The file to use as template. Default: `"TEMPLATE.md"`

### `output`

**Required** The output file. Default: `"README.md"`

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
