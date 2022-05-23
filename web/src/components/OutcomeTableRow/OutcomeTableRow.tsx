import React, { useState } from 'react'
import {
  ComputedOutcome,
  ComputedScope,
  ComputedSimpleAchievementStatus,
  Tag,
} from '../../types'
import { HeaderHashB64, WithHeaderHash } from '../../types/shared'
import AvatarsList from '../AvatarsList/AvatarsList'
import ExpandChevron from '../ExpandChevron/ExpandChevron'
import Icon from '../Icon/Icon'
import ProgressIndicator from '../ProgressIndicator/ProgressIndicator'
import TagsList from '../TagsList/TagsList'
import filterMatch, { OutcomeTableFilter } from './filterMatch'
import './OutcomeTableRow.scss'

export type OutcomeTableRowProps = {
  columnWidthPercentages: [string, string, string, string, string]
  projectTags: WithHeaderHash<Tag>[]
  outcome: ComputedOutcome
  filter: OutcomeTableFilter
  parentExpanded: boolean
  indentationLevel: number
  openExpandedView: (headerHash: HeaderHashB64) => void
}

const OutcomeTableRow: React.FC<OutcomeTableRowProps> = ({
  columnWidthPercentages,
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

  let progress = 0

  // TODO: refine this
  // because it can be confusing when task list progress
  // is out of sync with annotated 'Achieved' vs 'NotAchieved' achievement
  // status
  if (outcome.computedScope === ComputedScope.Small) {
    if (
      outcome.computedAchievementStatus.simple ===
      ComputedSimpleAchievementStatus.Achieved
    ) {
      // this is to account for the fact that manually setting
      // "Achieved" overrides the task list progress
      progress = 100
    } else if (
      outcome.computedAchievementStatus.tasksAchieved === 0 &&
      outcome.computedAchievementStatus.tasksTotal === 0
    ) {
      // avoid dividing 0 by 0
      progress = 0
    } else {
      progress =
        (outcome.computedAchievementStatus.tasksAchieved /
          outcome.computedAchievementStatus.tasksTotal) *
        100
    }
  } else {
    progress =
      (outcome.computedAchievementStatus.smallsAchieved /
        outcome.computedAchievementStatus.smallsTotal) *
      100
  }

  return (
    // TODO: find a smarter solution to structure table
    // so that the hover state applies to the whole row
    // and the map view icon would apear on hover
    <>
      {parentExpanded && match && (
        <div className="outcome-table-row-wrapper">
          {/* ID number metadata */}
          <div
            className="outcome-table-row-metadata-wrapper id-number"
            style={{
              width: columnWidthPercentages[0],
              minWidth: columnWidthPercentages[0],
            }}
          >
            {/* TODO: make ID number display dynamic */}
            {'123456'}
          </div>

          {/* Outcome statement & progress indicator metadata */}
          <div
            className="outcome-table-row-metadata-wrapper outcome-statement-wrapper"
            style={{
              width: columnWidthPercentages[1],
              minWidth: columnWidthPercentages[1],
            }}
          >
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
            {outcome.computedScope !== ComputedScope.Uncertain && (
              <ProgressIndicator progress={progress} />
            )}

            {/* Uncertain Icon (or not) */}
            {outcome.computedScope === ComputedScope.Uncertain && (
              <div className="outcome-statement-icon">
                <Icon
                  name="uncertain.svg"
                  className="not-hoverable uncertain"
                />
              </div>
            )}
            {/* Leaf Icon (or not) */}
            {outcome.children.length === 0 &&
              outcome.computedScope === ComputedScope.Small && (
                <div className="outcome-statement-icon">
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

          <div className="outcome-table-row-assignees-tags-time">
            {/* Assignees */}
            <div
              className="outcome-table-row-metadata-wrapper assignees"
              style={{
                width: columnWidthPercentages[2],
                minWidth: columnWidthPercentages[2],
              }}
            >
              <AvatarsList
                withStatus={false}
                size="small"
                profiles={outcome.members || []}
              />
            </div>

            {/* Tags */}
            <div
              className="outcome-table-row-metadata-wrapper tags"
              style={{
                width: columnWidthPercentages[3],
                minWidth: columnWidthPercentages[3],
              }}
            >
              <TagsList
                tags={projectTags}
                selectedTags={outcome.tags}
                showAddTagButton={false}
              />
            </div>

            {/* Time */}
            {/* TODO: update time display for different scopes */}
            <div
              className="outcome-table-row-metadata-wrapper time"
              style={{
                width: columnWidthPercentages[4],
                minWidth: columnWidthPercentages[4],
              }}
            >
              {/* {outcome.timeFrame} */}
              March 12 - 24, 2022
            </div>
          </div>
        </div>
      )}
      {outcome.children.length > 0 &&
        outcome.children.map((outcomeChild) => (
          <OutcomeTableRow
            columnWidthPercentages={columnWidthPercentages}
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
