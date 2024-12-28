// @dada78641/repo-version <https://github.com/msikma/repo-version>
// © MIT license

import type {GitRepoInfo} from './types.ts'

// Simple local cache.
const cachedGitInfo: {gitInfo: GitRepoInfo | null, updatedAt: number} = {
  gitInfo: null,
  updatedAt: 0,
}

/**
 * Returns true if the cache is fresh.
 * 
 * If not specified, the cache age is 1 minute.
 */
export function hasCachedData(maxAge: number | null = 60_000) {
  if (maxAge == null) {
    return false
  }
  const {gitInfo, updatedAt} = cachedGitInfo
  return gitInfo !== null && updatedAt > Date.now() - maxAge
}

/**
 * Returns the cached data.
 */
export function getCachedData(maxAge: number | null = 60_000): GitRepoInfo | null {
  if (hasCachedData(maxAge)) {
    return cachedGitInfo.gitInfo!
  }
  return null
}

/**
 * Stores Git repo info to cache.
 */
export function saveInfoToCache(gitInfo: GitRepoInfo | null) {
  if (gitInfo === null) {
    return
  }
  cachedGitInfo.gitInfo = gitInfo
  cachedGitInfo.updatedAt = Date.now()
}
