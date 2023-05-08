import React from 'react'

type SyncingIndicatorProps = {
  visible: boolean
}

const SyncingIndicator: React.FC<SyncingIndicatorProps> = ({ visible }) => {
  return visible ? <div>Syncing...</div> : <></>
}

export default SyncingIndicator
