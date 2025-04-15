import React from 'react'
import { WAL } from '@theweave/api'

interface ProjectAssetViewProps {
  wal: WAL
}
const ProjectAssetView: React.FC<ProjectAssetViewProps> = ({ wal }) => {
  return (
    <div>
      {/* Render the asset view here */}
      <h1>Asset View</h1>
      <p>Asset ID: {wal}</p>
      {/* Add more details as needed */}
    </div>
  )
}

export default ProjectAssetView
