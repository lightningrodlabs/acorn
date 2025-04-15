import React from 'react'
import './AttachmentListItem.scss'
import { WAL } from '@theweave/api'
import Typography from '../../../../Typography/Typography'
import Icon from '../../../../Icon/Icon'
import { AssetMeta } from '../../../../../hooks/useAttachments'
import { EntryHash } from '@holochain/client'
import { ProjectAssetMeta } from '../../../../../hooks/useProjectAttachments'

export type AttachmentListItemProps = {
  assetMeta: AssetMeta | ProjectAssetMeta
  openAsset: (wal: WAL) => void | Promise<void>
  removeAttachment: (relationHash: EntryHash) => Promise<void>
}

const AttachmentListItem: React.FC<AttachmentListItemProps> = ({
  assetMeta,
  openAsset,
  removeAttachment,
}) => {
  return (
    <div
      className="asset-list-item"
      onClick={() => {
        openAsset(assetMeta.wal)
      }}
    >
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
        <Typography style="caption3">
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

      {/* Delete Asset Button */}
      <div
        className="asset-list-item-delete-button"
        onClick={(e) => {
          e.stopPropagation()
          removeAttachment(assetMeta.relationHash)
        }}
      >
        <Icon
          name="delete-bin.svg"
          size="small"
          className="light-grey"
          withTooltip
          tooltipText="Remove Attachment"
        />
      </div>
    </div>
  )
}

export default AttachmentListItem
