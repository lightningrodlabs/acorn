import React from 'react'
import { ComputedOutcome, Tag } from '../../types'
import { HeaderHashB64, WithHeaderHash } from '../../types/shared'
import { OutcomeTableFilter } from '../OutcomeTableRow/filterMatch'
import OutcomeTableRow from '../OutcomeTableRow/OutcomeTableRow'
import './OutcomeTable.scss'

export type OutcomeTableProps = {
  projectTags: WithHeaderHash<Tag>[]
  outcomeTrees: ComputedOutcome[]
  filter: OutcomeTableFilter
  openExpandedView: (headerHash: HeaderHashB64) => void
}

const OutcomeTable: React.FC<OutcomeTableProps> = ({
  projectTags,
  outcomeTrees,
  filter,
  openExpandedView,
}) => {
  return (
    <table className="outcome-table-wrapper">
      <div className="outcome-table-metadata-header">ID#</div>
      <div className="outcome-table-metadata-header">Outcome Statement</div>
      <div className="outcome-table-metadata-header">Assignees</div>
      <div className="outcome-table-metadata-header">Tags</div>
      <div className="outcome-table-metadata-header">Time</div>
      {outcomeTrees.map((outcome) => (
        <OutcomeTableRow
          key={outcome.headerHash}
          projectTags={projectTags}
          outcome={outcome}
          filter={filter}
          parentExpanded={true}
          indentationLevel={0}
          openExpandedView={openExpandedView}
        />
      ))}
    </table>
  )
}

export default OutcomeTable
