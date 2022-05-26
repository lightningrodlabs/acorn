import React, { useState } from 'react'

import Modal, { ModalContent } from '../Modal/Modal'

const ExportMenuItem = ({ download, title, type, data, projectName }) => {
  const [popup, setPopup] = useState(false)

  return (
    <>
      <Modal active={popup} onClose={() => setPopup(false)}>
        <ModalContent
          heading="Exporting"
          icon="export.svg"
          content={
            <>
              You just exported the <b>{projectName}</b> canvas. You will be
              able to find it in your Downloads folder!
            </>
          }
          primaryButton="OK"
          primaryButtonAction={() => setPopup(false)}
        />
      </Modal>
      <a
        href={url(type, data)}
        onClick={() => {
          setPopup(true)
        }}
        download={download}
      >
        {title}
      </a>
    </>
  )
}
export default ExportMenuItem

function url(type, data) {
  let blob = {}
  if (type === 'csv') {
    const csvRows = []
    const agents = Object.keys(data.agents)
    const outcomes = Object.keys(data.outcomes)
    const connections = Object.keys(data.connections)
    const outcomeMembers = Object.keys(data.outcomeMembers)
    const outcomeComments = Object.keys(data.outcomeComments)
    const outcomeVotes = Object.keys(data.outcomeVotes)
    const entryPoints = Object.keys(data.entryPoints)
    const tags = Object.keys(data.tags)

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
    if (outcomes.length > 0)
      csvRows.push('\n' + loop('outcomes', outcomes, data.outcomes))
    if (connections.length > 0)
      csvRows.push('\n' + loop('connections', connections, data.connections))
    if (outcomeMembers.length > 0)
      csvRows.push(
        '\n' + loop('outcomeMembers', outcomeMembers, data.outcomeMembers)
      )
    if (outcomeComments.length > 0)
      csvRows.push(
        '\n' + loop('outcomeComments', outcomeComments, data.outcomeComments)
      )
    if (outcomeVotes.length > 0)
      csvRows.push('\n' + loop('outcomeVotes', outcomeVotes, data.outcomeVotes))
    if (entryPoints.length > 0)
      csvRows.push('\n' + loop('entryPoints', entryPoints, data.entryPoints))
    if (tags.length > 0)
      csvRows.push('\n' + loop('tags', tags, data.tags))

    blob = new Blob([csvRows.join('\n')], {
      type: 'text/csv',
    })
  } else {
    blob = new Blob([JSON.stringify(data, null, 2)], { type: '' })
  }
  const url = window.URL.createObjectURL(blob)
  return url
}
