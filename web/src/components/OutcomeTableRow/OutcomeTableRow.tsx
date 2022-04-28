import React, { useState } from 'react'
import { ComputedOutcome } from '../../types'
import Icon from '../Icon/Icon'
import filterMatch, { OutcomeTableFilter } from './filterMatch'
import './OutcomeTableRow.scss'

export type OutcomeTableRowProps = {
  outcome: ComputedOutcome
  filter: OutcomeTableFilter
  parentExpanded: boolean
  indentationLevel: number
  // TODO: define this type
  openExpandedView
}

const OutcomeTableRow: React.FC<OutcomeTableRowProps> = ({
  outcome,
  filter,
  parentExpanded,
  indentationLevel,
  openExpandedView,
}) => {
  //for now assume everything is expanded by default,
  // will need to look into how to expand collapse all in one action
  let [expanded, setExpanded] = useState(true)
  let match = filterMatch(outcome, filter)

  return (
    <>
      {parentExpanded && match && (
        <tr>
          <td>{'123456'}</td>
          <td>
            <div className="outcome-table-row">
              {'-'.repeat(indentationLevel)}
              {outcome.children.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setExpanded(!expanded)
                  }}
                >
                  {expanded ? 'v' : '>'}
                </button>
              )}
              {outcome.content}
              <div onClick={() => openExpandedView(outcome.headerHash)}>
                {/* @ts-ignore */}
                <Icon name="expand.svg" size="small" className="light-grey" />
              </div>
            </div>
          </td>
          <td>members</td>
          {/* <td>{outcome.members}</td> */}
          <td>{outcome.tags}</td>
          <td>{outcome.timeFrame}</td>
        </tr>
      )}
      {outcome.children.length > 0 &&
        outcome.children.map((outcomeChild) => (
          <OutcomeTableRow
            outcome={outcomeChild}
            filter={filter}
            parentExpanded={expanded && parentExpanded}
            indentationLevel={indentationLevel + 1}
            openExpandedView={openExpandedView}
          />
        ))}
    </>
  )
}

export default OutcomeTableRow
