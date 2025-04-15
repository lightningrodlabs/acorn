import React from 'react'
import { WAL } from '@theweave/api'

interface OutcomeAssetViewProps {
  wal: WAL
}
const OutcomeAssetView: React.FC<OutcomeAssetViewProps> = ({ wal }) => {
  return (
    <div>
      {/* Render the asset view here */}
      <h1>Asset View</h1>
      <p>Asset ID: {wal}</p>
      {/* Add more details as needed */}
    </div>
  )
}

export default OutcomeAssetView
