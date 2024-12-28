// @dada78641/repo-version <https://github.com/msikma/repo-version>
// © MIT license

export interface GitRepoInfo {
  // Current branch name, e.g. "branch_name".
  branch: string | null
  // Path to the branch file inside the .git directory, e.g. "refs/heads/branch_name".
  branchRef: string | null
  // Full commit hash.
  hash: string | null
  // Short commit hash (the first 7 characters of the full hash).
  shortHash: string | null
  // Number of commits in this branch.
  commits: number
}

// All info we can get from the HEAD file.
export type GitHeadFileInfo = Pick<GitRepoInfo, 'branch' | 'branchRef' | 'hash' | 'shortHash'>
// All info we can get from a branch file (e.g. files in .git/refs/**).
export type GitBranchFileInfo = Pick<GitRepoInfo, 'hash' | 'shortHash'>
