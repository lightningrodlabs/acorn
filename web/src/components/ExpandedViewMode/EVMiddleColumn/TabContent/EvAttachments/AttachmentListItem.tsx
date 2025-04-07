import React from 'react'
import './AttachmentListItem.scss'
import { WAL } from '@theweave/api'
import Typography from '../../../../Typography/Typography'
import Icon from '../../../../Icon/Icon'
import { AssetMeta } from '../../../../../hooks/useAttachments'

export type AttachmentListItemProps = {
  assetMeta: AssetMeta
  openAsset: (wal: WAL) => void
}

const AttachmentListItem: React.FC<AttachmentListItemProps> = ({
  assetMeta,
  openAsset,
}) => {
  return (
    <div className="outcome-list-item">
      {/* ID */}
      <div className="outcome-list-item-id">
        <Typography style="caption3">{}</Typography>
      </div>

      <div className="outcome-list-item-icon-wrapper uncertain">
        <Icon name="uncertain.svg" className="not-hoverable uncertain" />
      </div>

      {/* Outcome statement text */}
      <div
        className="outcome-list-item-statement"
        title={assetMeta.assetInfo.name}
      >
        <Typography style="body1">{assetMeta.assetInfo.name}</Typography>
      </div>

      {/* on click navigate to the Expanded View mode for that Outcome */}
      {/* Visible only while hovered on this child Outcome */}
      <div
        className="outcome-list-item-switch-button"
        onClick={() => {
          openAsset(assetMeta.wal)
        }}
      >
        <Icon
          name="enter.svg"
          size="small"
          className="light-grey"
          withTooltip
          tooltipText="Open Asset"
        />
      </div>
    </div>
  )
}

export default AttachmentListItem
