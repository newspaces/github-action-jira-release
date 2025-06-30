import { context } from '@actions/github'
import * as core from '@actions/core'

import setFixVersion from './jira-issues-updater'
import jiraClient from './jira-client'

async function run() {
  try {
    const tag_name = context.github.ref_name

    let jiraVersionName = `${context.repo.repo}-${tag_name.replace(/^v/, '')}`

    const data = await jiraClient
      .post('rest/api/3/version', {
        json: {
          name: jiraVersionName,
          projectId: core.getInput('project_id'),
          description: tag_name,
          released: true,
          releaseDate: (new Date().toISOString()).split('T')[0],
        },
      })
      .json()

    core.setOutput('jira_release_id', data ? data.id : '???')
    core.setOutput('jira_release_name', data ? data.name : '???')

    await setFixVersion(data.name)
  } catch (e) {
    console.error('Error', e)
    core.setFailed(e.toString())
  }
}

run()
