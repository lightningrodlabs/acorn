import React from 'react'
import EvReadOnlyHeading from '../../../../EvReadOnlyHeading/EvReadOnlyHeading'
import Icon from '../../../../Icon/Icon'
import './EvAttachments.scss'
import AddAttachment from './AddAttachment'
import { getWeaveClient } from '../../../../../hcWebsockets'
import { ComputedOutcome } from '../../../../../types'
import { EntryHash } from '@holochain/client'
import { AssetMeta } from '../../../../../hooks/useAttachments'
import AttachmentListItem from './AttachmentListItem'

export type EvAttachmentsProps = {
  outcome: ComputedOutcome
  projectId: string
  attachmentsInfo?: AssetMeta[]
  addAttachment?: () => Promise<void>
}

const EvAttachments: React.FC<EvAttachmentsProps> = ({
  outcome,
  projectId,
  attachmentsInfo: propAttachmentsInfo,
  addAttachment: propAddAttachment,
}) => {
  const weaveClient = getWeaveClient()

  // Use the attachments info from props
  const attachmentsInfo = propAttachmentsInfo || []

  const addAttachment = async () => {
    if (propAddAttachment) {
      await propAddAttachment()
    }
  }

  const removeAttachment = async (relationHash: EntryHash) => {
    console.log('Removing attachment with relation hash:', relationHash)
    await weaveClient.assets.removeAssetRelation(relationHash)
  }
  return (
    <div className="ev-children-view-wrapper">
      <EvReadOnlyHeading
        headingText={outcome.content}
        overviewIcon={<Icon name="attachment.svg" className="not-hoverable" />}
        overviewText={
          attachmentsInfo.length === 1
            ? `1 attachment`
            : `${attachmentsInfo.length} attachments`
        }
      />
      {attachmentsInfo && (
        <div className="ev-children-view-outcome-list">
          {attachmentsInfo.map((assetInfo, i) => {
            return (
              <AttachmentListItem
                key={i}
                assetMeta={assetInfo}
                openAsset={async (wal) => {
                  await weaveClient.openAsset(wal)
                }}
                removeAttachment={removeAttachment}
              />
            )
          })}
        </div>
      )}
      <div className="ev-attachments-add-new">
        <AddAttachment onAddAttachment={addAttachment} />
      </div>
    </div>
  )
}

export default EvAttachments
