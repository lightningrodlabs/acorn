import React, { useState } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import { ComputedOutcome, Tag } from '../../types'
import { ActionHashB64, AgentPubKeyB64, WithActionHash } from '../../types/shared'
import { OutcomeTableFilter } from '../OutcomeTableRow/filterMatch'
import OutcomeTableRow from '../OutcomeTableRow/OutcomeTableRow'
import './OutcomeTable.scss'

export type OutcomeTableProps = {
  projectTags: WithActionHash<Tag>[]
  outcomeTrees: ComputedOutcome[]
  topPriorityOutcomes: ActionHashB64[]
  presentMembers: AgentPubKeyB64[]
  filter: OutcomeTableFilter
  openExpandedView: (actionHash: ActionHashB64) => void
  goToOutcome: (actionHash: ActionHashB64) => void
}

const OutcomeTable: React.FC<OutcomeTableProps> = ({
  topPriorityOutcomes,
  projectTags,
  outcomeTrees,
  presentMembers,
  filter,
  openExpandedView,
  goToOutcome,
}) => {
  // the first two can be hardcoded
  // the final three should always add up to 100%
  // the final three split the remaining space
  const [columnWidthPercentages, setColumnWidthPercentages] = useState<
    [string, string, string, string, string]
  >(['5rem', '45rem', '50%', '50%', '0%'])
  // >(['5rem', '40rem', '33%', '33%', '34%'])

  // goToOutcome is not enough, we also
  // need to navigate back to the Map View
  const history = useHistory()
  const location = useLocation()
  const navAndGoToOutcome = (actionHash: ActionHashB64) => {
    history.push(location.pathname.replace('table', 'map'))
    goToOutcome(actionHash)
  }

  return (
    <div className="outcome-table-wrapper">
      {/* Headers */}
      <div className="outcome-table-metadata-header">
        <div
          className="outcome-table-metadata-header-label id-label"
          style={{
            width: columnWidthPercentages[0],
            minWidth: columnWidthPercentages[0],
          }}
        >
          ID#
        </div>
        <div
          className="outcome-table-metadata-header-label"
          style={{
            width: columnWidthPercentages[1],
            minWidth: columnWidthPercentages[1],
          }}
        >
          Outcome Statement
        </div>
        <div className="outcome-table-metadata-header-assignees-tags-time">
          <div
            className="outcome-table-metadata-header-label"
            style={{
              width: columnWidthPercentages[2],
              minWidth: columnWidthPercentages[2],
            }}
          >
            Assignees
          </div>
          <div
            className="outcome-table-metadata-header-label"
            style={{
              width: columnWidthPercentages[3],
              minWidth: columnWidthPercentages[3],
            }}
          >
            Tags
          </div>
          {/* TODO: add back time column with hooked up data */}
          {/* <div
            className="outcome-table-metadata-header-label"
            style={{
              width: columnWidthPercentages[4],
              minWidth: columnWidthPercentages[4],
            }}
          >
            Time
          </div> */}
        </div>
      </div>

      {/* Data Rows */}
      <div className='outcome-table-rows'>
        <div>
          {outcomeTrees.map((outcome) => (
            <OutcomeTableRow
              key={outcome.actionHash}
              columnWidthPercentages={columnWidthPercentages}
              projectTags={projectTags}
              topPriorityOutcomes={topPriorityOutcomes}
              outcome={outcome}
              presentMembers={presentMembers}
              filter={filter}
              parentExpanded={true}
              indentationLevel={0}
              openExpandedView={openExpandedView}
              goToOutcome={navAndGoToOutcome}
              expandByDefault={outcomeTrees.length <= 10}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default OutcomeTable
