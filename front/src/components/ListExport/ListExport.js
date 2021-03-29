import React, { useState } from 'react'
import { connect } from 'react-redux'

import Modal, { ModalContent } from '../Modal/Modal'

const ListExport = ({ download, title, type, data, projectName }) => {
  const [popup, setPopup] = useState(false)

  return (
    <>
      <Modal active={popup} onClose={() => setPopup(false)}>
        <ModalContent
          heading='Exporting'
          icon='export.svg'
          content={
            <>
              You just exported the <b>{projectName}</b> canvas. You will be
              able to find it in your Downloads folder!
            </>
          }
          primaryButton='OK'
          primaryButtonAction={() => setPopup(false)}
        />
      </Modal>
      <a
        href={url(type, data)}
        onClick={() => {
          setPopup(true)
        }}
        download={download}>
        {title}
      </a>
    </>
  )
}

function url(type, data) {
  let blob = {}
  if (type === 'csv') {
    const csvRows = []
    const agents = Object.keys(data.agents)
    const goals = Object.keys(data.goals)
    const edges = Object.keys(data.edges)
    const goalMembers = Object.keys(data.goalMembers)
    const goalComments = Object.keys(data.goalComments)
    const goalVotes = Object.keys(data.goalVotes)
    const entryPoints = Object.keys(data.entryPoints)

    const loop = (dataset, headers, data) => {
      const csvRows = []

      csvRows.push(dataset)
      csvRows.push(Object.keys(data[headers[0]]).join(','))
      for (const index in headers) {
        csvRows.push(Object.values(data[headers[index]]))
      }
      return csvRows.join('\n')
    }

    if (agents.length > 0) csvRows.push(loop('agents', agents, data.agents))
    if (goals.length > 0) csvRows.push('\n' + loop('goals', goals, data.goals))
    if (edges.length > 0) csvRows.push('\n' + loop('edges', edges, data.edges))
    if (goalMembers.length > 0)
      csvRows.push('\n' + loop('goalMembers', goalMembers, data.goalMembers))
    if (goalComments.length > 0)
      csvRows.push('\n' + loop('goalComments', goalComments, data.goalComments))
    if (goalVotes.length > 0)
      csvRows.push('\n' + loop('goalVotes', goalVotes, data.goalVotes))
    if (entryPoints.length > 0)
      csvRows.push('\n' + loop('entryPoints', entryPoints, data.entryPoints))

    blob = new Blob([csvRows.join('\n')], {
      type: 'text/csv',
    })
  } else {
    blob = new Blob([JSON.stringify(data, null, 2)], { type: '' })
  }
  const url = window.URL.createObjectURL(blob)
  return url
}
function mapDispatchToProps(dispatch) {
  return {}
}
function mapStateToProps(state) {
  const {
    ui: { activeProject },
  } = state
  // defensive coding for loading phase
  const goals = state.projects.goals[activeProject] || {}
  const edges = state.projects.edges[activeProject] || {}
  const goalMembers = state.projects.goalMembers[activeProject] || {}
  const goalComments = state.projects.goalComments[activeProject] || {}
  const goalVotes = state.projects.goalVotes[activeProject] || {}
  const entryPoints = state.projects.entryPoints[activeProject] || {}
  const activeProjectMeta = state.projects.projectMeta[activeProject] || {}
  const projectName = activeProjectMeta.name || ''

  return {
    projectName,
    data: {
      projectMeta: activeProjectMeta,
      agents: state.agents,
      goals,
      edges,
      goalMembers,
      goalComments,
      goalVotes,
      entryPoints,
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ListExport)
