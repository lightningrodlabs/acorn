import React from 'react'
import { WAL } from '@theweave/api'
import { hrlToString } from '@holochain-open-dev/utils'

interface ProjectAssetViewProps {
  wal: WAL
}
const ProjectAssetView: React.FC<ProjectAssetViewProps> = ({ wal }) => {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>Project View</h2>
      <p>The project view has not been implemented yet.</p>
      <p style={{ color: '#666', fontSize: '0.9em', overflow: 'scroll' }}>
        Project ID: {hrlToString(wal.hrl)}
      </p>
    </div>
  )
}

export default ProjectAssetView
