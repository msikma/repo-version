// @dada78641/repo-version <https://github.com/msikma/repo-version>
// © MIT license

import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import * as zlib from 'node:zlib'
import {hasCachedData, getCachedData, saveInfoToCache} from './cache.ts'
import type {GitRepoInfo, GitHeadFileInfo, GitBranchFileInfo} from './types.ts'

/**
 * Decompresses a zlib compressed Git object file.
 */
async function decompressGitCommit(commitPath: string): Promise<string> {
  const compressedData = await fs.readFile(commitPath, null)
  return new Promise((resolve, reject) => {
    zlib.inflate(compressedData, (err, buffer) => {
      if (err) {
        return reject(err)
      }
      resolve(buffer.toString('utf8'))
    })
  })
}

/**
 * Parses a decompressed Git object file to find parent commit hashes.
 */
function parseCommitParents(commitContent: string): string[] {
  const lines = commitContent.split('\n')
  return lines
    .filter((line) => line.startsWith('parent '))
    .map((line) => line.split(' ')[1].trim())
}

/**
 * Parses a Git repo HEAD value.
 * 
 * This will typically be "ref: refs/heads/branch_name".
 * If it does not start with "ref:", it means we are in detached head state.
 * In that case the head file contains the commit hash.
 */
function parseHeadFile(content: string): GitHeadFileInfo {
  if (content.startsWith('ref:')) {
    // Parse the "ref: refs/heads/branch_name" structure.
    const branchRef = content.split(' ')[1].trim()
    const branchName = branchRef.split('/').slice(-1)[0]
    return {
      branch: branchName,
      branchRef,
      hash: null,
      shortHash: null,
    }
  }
  else {
    // We are in detached head state.
    return {
      branch: null,
      branchRef: null,
      hash: content.trim(),
      shortHash: content.trim().slice(0, 7)
    }
  }
}

/**
 * Parses a Git repo branch file.
 * 
 * This is the refs/branches/* file we obtained from the HEAD file.
 */
function parseBranchFile(content: string): GitBranchFileInfo {
  return {
    hash: content.trim(),
    shortHash: content.trim().slice(0, 7)
  }
}

/**
 * Reads the HEAD file and returns its information.
 */
async function getGitHeadFileValue(gitDir: string): Promise<GitHeadFileInfo> {
  const fileContent = await fs.readFile(path.join(gitDir, 'HEAD'), 'utf8')
  return parseHeadFile(fileContent)
}

/**
 * Returns information from the branch ref file, if it exists.
 */
async function getGitBranchFileValue(gitDir: string, branchRef: string | null): Promise<GitBranchFileInfo> {
  if (branchRef === null) {
    // If we don't have a branchRef, it means we already got the hash from the HEAD file.
    return {hash: null, shortHash: null}
  }
  const fileContent = await fs.readFile(path.join(gitDir, branchRef), 'utf8')
  return parseBranchFile(fileContent)
}

/**
 * Counts the number of commits from a given starting commit hash.
 * 
 * This is the most computationally expensive operation.
 */
async function getGitCommitCount(gitDir: string, startHash: string | null): Promise<number> {
  if (startHash === null) {
    return 0
  }

  const visited = new Set<string>()
  const stack = [startHash]
  let count = 0

  while (stack.length > 0) {
    const hash = stack.pop()!
    if (visited.has(hash)) continue

    visited.add(hash)
    count++

    const commitPath = path.join(gitDir, 'objects', hash.slice(0, 2), hash.slice(2))
    const commitContent = await decompressGitCommit(commitPath)
    const commitParents = parseCommitParents(commitContent)
    stack.push(...commitParents)
  }

  return count
}

/**
 * Resolves the location of the Git repo directory.
 * 
 * The .git file is either a directory (like normal), or a file containing a gitdir: path.
 * The latter case is true if the .git repo is a submodule.
 */
async function locateGitDir(repoPath: string): Promise<string | null> {
  const gitFile = path.join(repoPath, '.git')
  try {
    const stat = await fs.stat(gitFile)
    if (stat.isDirectory()) {
      // Standard case.
      return gitFile
    }
    else if (stat.isFile()) {
      // Submodule case: .git is a file pointing to the actual Git directory.
      const gitFileContents = await fs.readFile(gitFile, 'utf8')
      if (!gitFileContents.startsWith('gitdir:')) {
        // This should never be the case. In this situation the .git file is invalid.
        return null
      }
      // The path will be relative to the repo.
      const gitDir = gitFileContents.split(':')[1].trim()
      return path.resolve(repoPath, gitDir)
    }
  }
  catch {
    return null
  }
  return null
}

/**
 * Returns Git repo state information from a given Git repo.
 */
export async function getGitRepoInfo(repoPath: string): Promise<GitRepoInfo | null> {
  try {
    const gitDir = await locateGitDir(repoPath)
    if (!gitDir) throw new Error('Git repo not found or invalid')

    const headFileValue = await getGitHeadFileValue(gitDir)
    const branchFileValue = await getGitBranchFileValue(gitDir, headFileValue.branchRef)
    const commitCount = await getGitCommitCount(gitDir, branchFileValue.hash ?? headFileValue.hash)

    return {
      branch: headFileValue.branch,
      branchRef: headFileValue.branchRef,
      hash: branchFileValue.hash ?? headFileValue.hash,
      shortHash: branchFileValue.shortHash ?? headFileValue.shortHash,
      commits: commitCount
    }
  }
  catch {
    return null
  }
}

/**
 * Returns Git repo state information from this app's Git repo.
 */
export async function getGitRepoInfoCached(repoPath: string, maxAge: number): Promise<GitRepoInfo | null> {
  if (hasCachedData(maxAge)) {
    return getCachedData(maxAge)
  }
  const gitInfo = await getGitRepoInfo(repoPath)
  saveInfoToCache(gitInfo)
  return gitInfo
}
