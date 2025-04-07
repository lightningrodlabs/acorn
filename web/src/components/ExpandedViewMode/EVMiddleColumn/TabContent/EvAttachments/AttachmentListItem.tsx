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
    <div className="asset-list-item">
      {/* Asset Icon */}
      <div className="asset-list-item-icon-wrapper">
        <img 
          src={assetMeta.assetInfo.icon_src} 
          alt={`${assetMeta.assetInfo.name} icon`}
          className="asset-icon"
        />
      </div>

      {/* Asset and Applet Info */}
      <div
        className="asset-list-item-info"
        title={`${assetMeta.assetInfo.name} (${assetMeta.appletInfo.appletName})`}
      >
        <Typography style="body1">{assetMeta.assetInfo.name}</Typography>
        <Typography style="caption3" className="applet-name">
          {assetMeta.appletInfo.appletName}
        </Typography>
      </div>

      {/* Applet Icon */}
      <div className="asset-list-item-applet-icon">
        <img 
          src={assetMeta.appletInfo.appletIcon} 
          alt={`${assetMeta.appletInfo.appletName} icon`}
        />
      </div>

      {/* Open Asset Button - Visible only while hovered */}
      <div
        className="asset-list-item-switch-button"
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
