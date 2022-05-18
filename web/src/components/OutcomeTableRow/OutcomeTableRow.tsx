import React, { useState } from 'react'
import { ComputedOutcome, ComputedScope, Tag } from '../../types'
import { HeaderHashB64, WithHeaderHash } from '../../types/shared'
import AvatarsList from '../AvatarsList/AvatarsList'
import ExpandChevron from '../ExpandChevron/ExpandChevron'
import Icon from '../Icon/Icon'
import ProgressIndicator from '../ProgressIndicator/ProgressIndicator'
import TagsList from '../TagsList/TagsList'
import filterMatch, { OutcomeTableFilter } from './filterMatch'
import './OutcomeTableRow.scss'

export type OutcomeTableRowProps = {
  projectTags: WithHeaderHash<Tag>[]
  outcome: ComputedOutcome
  filter: OutcomeTableFilter
  parentExpanded: boolean
  indentationLevel: number
  openExpandedView: (headerHash: HeaderHashB64) => void
}

const OutcomeTableRow: React.FC<OutcomeTableRowProps> = ({
  projectTags,
  outcome,
  filter,
  parentExpanded,
  indentationLevel,
  openExpandedView,
}) => {
  //for now assume everything is expanded by default,
  // will need to look into how to expand collapse all in one action
  let [expanded, setExpanded] = useState(false)
  let match = filterMatch(outcome, filter)

  return (
    // TODO: find a smarter solution to structure table
    // so that the hover state applies to the whole row
    // and the map view icon would apear on hover
    <>
      {parentExpanded && match && (
        <>
          {/* ID number metadata */}
          <div className="outcome-table-row-metadata-wrapper id-number">
            {/* TODO: make ID number display dynamic */}
            {'123456'}
          </div>

          {/* Outcome statement & progress indicator metadata */}
          <div className="outcome-table-row-metadata-wrapper outcome-statement-wrapper">
            {/* TODO: make the spacing for nested children right */}
            {/* the width 2.375rem below should match the chevron width on the left */}
            <div style={{ marginLeft: `${indentationLevel * 2.25}rem` }} />
            {outcome.children.length > 0 && (
              /* expand chevron component */
              <>
                <ExpandChevron
                  expanded={expanded}
                  onClick={() => {
                    setExpanded(!expanded)
                  }}
                />
              </>
            )}

            {/* Progress Indicator */}
            <ProgressIndicator
              progress={
                (outcome.computedAchievementStatus.smallsAchieved /
                  outcome.computedAchievementStatus.smallsTotal) *
                100
              }
            />

            {/* Leaf Icon (or not) */}
            {outcome.children.length === 0 &&
              outcome.computedScope === ComputedScope.Small && (
                <div className="outcome-statement-leaf-icon">
                  <Icon name="leaf.svg" className="not-hoverable" />
                </div>
              )}

            {/* Outcome statement text */}
            <div
              className="outcome-statement-text"
              onClick={() => openExpandedView(outcome.headerHash)}
              title={outcome.content}
            >
              {outcome.content}
            </div>
          </div>

          {/* Assignees */}
          <div className="outcome-table-row-metadata-wrapper assignees">
            <AvatarsList
              withStatus={false}
              size="small"
              profiles={outcome.members || []}
            />
          </div>

          {/* Tags */}
          <div className="outcome-table-row-metadata-wrapper tags">
            <TagsList
              tags={projectTags}
              selectedTags={outcome.tags}
              showAddTagButton={false}
            />
          </div>

          {/* Time */}
          {/* TODO: update time display for different scopes */}
          <div className="outcome-table-row-metadata-wrapper time">
            {/* {outcome.timeFrame} */}
            March 12 - 24, 2022
          </div>
        </>
      )}
      {outcome.children.length > 0 &&
        outcome.children.map((outcomeChild) => (
          <OutcomeTableRow
            projectTags={projectTags}
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
