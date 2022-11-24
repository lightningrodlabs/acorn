import React from 'react'
import './CollapsedChildrenPills.scss'

import {
  ComputedOutcome,
  ComputedScope,
  ComputedSimpleAchievementStatus,
  Tag,
} from '../../types'

import {
  getOutcomeWidth,
  getOutcomeHeight,
  CONNECTOR_VERTICAL_SPACING,
} from '../../drawing/dimensions'
import { coordsCanvasToPage } from '../../drawing/coordinateSystems'
import DescendantsAchievementStatus from '../DescendantsAchievementStatus/DescendantsAchievementStatus'
import { ActionHashB64, CellIdString, WithActionHash } from '../../types/shared'

export type CollapsedChildrenPillProps = {
  projectTags: WithActionHash<Tag>[]
  outcome: ComputedOutcome
  outcomeCoordinates: {
    x: number
    y: number
  }
  translate: { x: number; y: number }
  zoomLevel: number
  activeProject: CellIdString
  expandOutcome: (
    projectCellId: CellIdString,
    outcomeActionHash: ActionHashB64
  ) => void
  canvas: HTMLCanvasElement
}

const CollapsedChildrenPill: React.FC<CollapsedChildrenPillProps> = ({
  projectTags,
  outcome,
  outcomeCoordinates,
  translate,
  zoomLevel,
  activeProject,
  expandOutcome,
  canvas,
}) => {
  const ctx = canvas.getContext('2d')
  const outcomeWidth = getOutcomeWidth({ outcome, zoomLevel })
  const outcomeHeight = getOutcomeHeight({
    ctx,
    outcome,
    projectTags,
    zoomLevel,
    width: outcomeWidth,
  })

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

  const pillLeftCoordinate = outcomeCoordinates.x + outcomeWidth / 2
  const pillTopCoordinate = outcomeCoordinates.y + outcomeHeight + 16

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
  canvas: HTMLCanvasElement
  outcomes: {
    [actionHash: string]: ComputedOutcome
  }
  activeProject: CellIdString
  projectTags: WithActionHash<Tag>[]
  translate: { x: number; y: number }
  zoomLevel: number
  coordinates: {
    [outcomeActionHash: ActionHashB64]: {
      x: number
      y: number
    }
  }
  projectCollapsedOutcomes: ActionHashB64[]
  expandOutcome: (
    projectCellId: CellIdString,
    outcomeActionHash: ActionHashB64
  ) => void
}

const CollapsedChildrenPills: React.FC<CollapsedChildrenPillsProps> = ({
  canvas,
  outcomes,
  activeProject,
  projectTags,
  translate,
  zoomLevel,
  coordinates,
  projectCollapsedOutcomes,
  expandOutcome,
}) => {
  return (
    <>
      {projectCollapsedOutcomes.map((outcomeActionHash) => {
        const outcomeCoordinates = coordinates[outcomeActionHash]
        const outcome = outcomes[outcomeActionHash]
        return (
          <div key={outcomeActionHash}>
            {outcome && outcomeCoordinates && (
              <CollapsedChildrenPill
                canvas={canvas}
                projectTags={projectTags}
                activeProject={activeProject}
                outcome={outcome}
                outcomeCoordinates={outcomeCoordinates}
                translate={translate}
                zoomLevel={zoomLevel}
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
