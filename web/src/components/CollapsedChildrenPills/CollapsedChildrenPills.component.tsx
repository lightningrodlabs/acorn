import React from 'react'
import './CollapsedChildrenPills.scss'

import {
  ComputedOutcome,
  ComputedScope,
  ComputedSimpleAchievementStatus,
} from '../../types'

import DescendantsAchievementStatus from '../DescendantsAchievementStatus/DescendantsAchievementStatus'
import { ActionHashB64, CellIdString, WithActionHash } from '../../types/shared'
import { CoordinatesState, DimensionsState } from '../../redux/ephemeral/layout/state-type'

export type CollapsedChildrenPillProps = {
  outcome: ComputedOutcome
  outcomeCoordinates: {
    x: number
    y: number
  }
  outcomeDimensions: {
    width: number
    height: number
  }
  activeProject: CellIdString
  expandOutcome: (
    projectCellId: CellIdString,
    outcomeActionHash: ActionHashB64
  ) => void
}

const CollapsedChildrenPill: React.FC<CollapsedChildrenPillProps> = ({
  outcome,
  outcomeCoordinates,
  outcomeDimensions,
  activeProject,
  expandOutcome,
}) => {

  // THIS IS TO DO WITH WHAT APPROACH TO RENDERING
  // THESE COLLAPSED CHILDREN PILLS COMPONENTS...
  // SCALING OR NON-SCALING
  // calculate the coordinates on the page, based
  // on what the coordinates on the canvas would be
  // const { x: pillLeftCoordinate, y: pillTopCoordinate } = coordsCanvasToPage(
  //   {
  //     x: outcomeCoordinates.x + outcomeWidth / 2,
  //     y: outcomeCoordinates.y + outcomeHeight + 16,
  //   },
  //   translate,
  //   zoomLevel
  // )

  const pillLeftCoordinate = outcomeCoordinates.x + outcomeDimensions.width / 2
  const pillTopCoordinate = outcomeCoordinates.y + outcomeDimensions.height + 16

  // a default in case of loading/transitioning
  const computedScope = outcome ? outcome.computedScope : ComputedScope.Small
  const computedAchievementStatus = outcome
    ? outcome.computedAchievementStatus
    : {
        uncertains: 0,
        smallsAchieved: 0,
        smallsTotal: 0,
        tasksAchieved: 0,
        tasksTotal: 0,
        simple: ComputedSimpleAchievementStatus.NotAchieved,
      }
  const childrenCount = outcome ? outcome.children.length : 0

  return (
    <div
      className="collapsed-children-pill-wrapper"
      style={{
        left: pillLeftCoordinate,
        top: pillTopCoordinate,
      }}
      onClick={() => expandOutcome(activeProject, outcome.actionHash)}
    >
      <DescendantsAchievementStatus
        childrenCount={childrenCount}
        computedScope={computedScope}
        computedAchievementStatus={computedAchievementStatus}
        hideMoreInfo
      />
    </div>
  )
}

export type CollapsedChildrenPillsProps = {
  outcomes: {
    [actionHash: string]: ComputedOutcome
  }
  activeProject: CellIdString
  coordinates: CoordinatesState
  dimensions: DimensionsState
  projectCollapsedOutcomes: ActionHashB64[]
  expandOutcome: (
    projectCellId: CellIdString,
    outcomeActionHash: ActionHashB64
  ) => void
}

const CollapsedChildrenPills: React.FC<CollapsedChildrenPillsProps> = ({
  outcomes,
  activeProject,
  coordinates,
  dimensions,
  projectCollapsedOutcomes,
  expandOutcome,
}) => {
  return (
    <>
      {projectCollapsedOutcomes.map((outcomeActionHash) => {
        const outcomeCoordinates = coordinates[outcomeActionHash]
        const outcomeDimensions = dimensions[outcomeActionHash]
        const outcome = outcomes[outcomeActionHash]
        return (
          <div key={outcomeActionHash}>
            {outcome && outcomeCoordinates && (
              <CollapsedChildrenPill
                activeProject={activeProject}
                outcome={outcome}
                outcomeCoordinates={outcomeCoordinates}
                outcomeDimensions={outcomeDimensions}
                expandOutcome={expandOutcome}
              />
            )}
          </div>
        )
      })}
    </>
  )
}
export default CollapsedChildrenPills
