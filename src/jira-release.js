import { context } from '@actions/github'
import * as core from '@actions/core'

import setFixVersion from './jira-issues-updater'
import jiraClient from './jira-client'
import getJiraTicketsFromCommits from './github-api-client'

async function run() {
  try {
    const tag_name = context.ref.split('/').pop()

    let jiraVersionName = `${context.repo.repo}-${tag_name.replace(/^v/, '')}`

    const tickets = await getJiraTicketsFromCommits()
    console.log('tickets', tickets)

    const data = await jiraClient
      .post('rest/api/3/version', {
        json: {
          name: jiraVersionName,
          projectId: core.getInput('project_id'),
          description: tickets.join(','),
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
