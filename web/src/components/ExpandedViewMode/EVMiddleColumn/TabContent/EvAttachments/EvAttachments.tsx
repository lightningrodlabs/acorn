import React from 'react'
import EvReadOnlyHeading from '../../../../EvReadOnlyHeading/EvReadOnlyHeading'
import Icon from '../../../../Icon/Icon'
import './EvAttachments.scss'
import AddAttachment from './AddAttachment'
import { getWeaveClient } from '../../../../../hcWebsockets'
import { ComputedOutcome } from '../../../../../types'
import { WAL } from '@theweave/api'
import { CellIdWrapper } from '../../../../../domain/cellId'
import { decodeHashFromBase64 } from '@holochain/client'
import { useAttachments } from '../../../../../hooks/useAttachments'
import AttachmentListItem from './AttachmentListItem'

export type EvAttachmentsProps = {
  outcome: ComputedOutcome
  projectId: string
}

const EvAttachments: React.FC<EvAttachmentsProps> = ({
  outcome,
  projectId,
}) => {
  const weaveClient = getWeaveClient()
  const cellIdWrapper = CellIdWrapper.fromCellIdString(projectId)
  const thisWal: WAL = {
    hrl: [cellIdWrapper.getDnaHash(), decodeHashFromBase64(outcome.actionHash)],
    context: 'outcome',
  }

  const { attachmentsInfo } = useAttachments(thisWal)
  const addAttachment = async () => {
    const wal = await weaveClient.assets.userSelectAsset()
    if (wal) {
      await weaveClient.assets.addAssetRelation(thisWal, wal)
    }
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
