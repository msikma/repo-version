// @dada78641/repo-version <https://github.com/msikma/repo-version>
// © MIT license

import {describe, it, expect, beforeAll, afterAll} from 'vitest'
import {execSync} from 'node:child_process'
import {mkdtempSync, rmdirSync, writeFileSync} from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import {getGitRepoInfo} from './git.ts'

describe('getGitRepoInfo', () => {
  let tempDir: string

  beforeAll(() => {
    // We'll create a temporary directory and run a couple of git commits in it.
    // Then we'll check if the state of the repo matches what we expect.
    tempDir = mkdtempSync(path.join(os.tmpdir(), 'git-test-'))

    execSync('git init', {cwd: tempDir})
    execSync('git branch -M main', {cwd: tempDir})

    writeFileSync(path.join(tempDir, 'file1.txt'), 'file 1')
    execSync('git add file1.txt', {cwd: tempDir})
    execSync('git commit -m "First commit"', {cwd: tempDir})

    writeFileSync(path.join(tempDir, 'file2.txt'), 'file 2')
    execSync('git add file2.txt', {cwd: tempDir})
    execSync('git commit -m "Second commit"', {cwd: tempDir})
  })

  afterAll(() => {
    if (tempDir) {
      rmdirSync(tempDir, {recursive: true})
    }
  })

  it('should retrieve correct Git repository info', async () => {
    const repoInfo = (await getGitRepoInfo(tempDir))!

    // Verify branch name
    expect(repoInfo.branch).toBe('main')
    expect(repoInfo.branchRef).toBe('refs/heads/main')

    // Verify commit hash
    const fullHash = execSync('git rev-parse HEAD', {cwd: tempDir}).toString().trim()
    const shortHash = fullHash.slice(0, 7)
    expect(repoInfo.hash).toBe(fullHash)
    expect(repoInfo.shortHash).toBe(shortHash)

    // Verify commit count
    expect(repoInfo.commits).toBe(2)
  })
})
