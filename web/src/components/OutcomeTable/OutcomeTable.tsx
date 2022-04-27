import React from 'react'
import { HeaderHashB64 } from '../../types/shared'
import { OutcomeTableFilter } from '../OutcomeTableRow/filterMatch'
import OutcomeTableRow from '../OutcomeTableRow/OutcomeTableRow'
import './OutcomeTable.scss'

export type OutcomeTableProps = {
  outcomeTrees: any
  filter: OutcomeTableFilter
  openExpandedView: (headerHash: HeaderHashB64) => void
}

const OutcomeTable: React.FC<OutcomeTableProps> = ({
  outcomeTrees,
  filter,
  openExpandedView,
}) => {
  return (
    <table>
      <thead>
        <tr>
          <th>ID#</th>
          <th>Outcome Statement</th>
          <th>Assignees</th>
          <th>Tags</th>
          <th>Time</th>
        </tr>
      </thead>
      <tbody>
        {outcomeTrees.map((outcome) => (
          <OutcomeTableRow
            outcome={outcome}
            filter={filter}
            parentExpanded={true}
            indentationLevel={0}
            openExpandedView={openExpandedView}
          />
        ))}
      </tbody>
    </table>
  )
}

export default OutcomeTable
