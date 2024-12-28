[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=fff)](https://www.typescriptlang.org/) [![MIT license](https://img.shields.io/badge/license-MIT-brightgreen.svg)](https://opensource.org/licenses/MIT) [![npm version](https://badge.fury.io/js/@dada78641%2Frepo-version.svg)](https://badge.fury.io/js/@dada78641%2Frepo-version)

# @dada78641/repo-version

**repo-version** is a simple and lightweight library designed to retrieve versioning information from a Git repository.

It extracts data directly from the .git directory without spawning a subprocess.

## Usage

```bash
npm i @dada78641/repo-version
```

```ts
import {getGitRepoInfo, type GitRepoInfo} from '@dada78641/repo-version'

// should have .git directory inside
const repoInfo: GitRepoInfo = await getGitRepoInfo('/path/to/my/project')
console.log(repoInfo)

// logs:
//
// {
//   branch: 'develop',
//   branchRef: 'refs/heads/develop',
//   hash: 'd59e60e50b13091cb86e8d267419820883cabc02',
//   shortHash: 'd59e60e',
//   commits: 3
// }
```

If a .git directory is not found or invalid, getGitRepoInfo() will throw an error.

## License

MIT licensed.
