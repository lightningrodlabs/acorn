import React from 'react'
import IndentedTreeView from '../../../components/IndentedTreeView/IndentedTreeView'
import { LayeringAlgorithm } from '../../../types'
import GantViewTimeline from './GantViewTimeline'

export type GanttViewContentProps = {}

const GanttViewContent: React.FC<GanttViewContentProps> = ({}) => {
  return (
    // inside the div with gantt-view-timeline class, we will render the timeline

    <div className="gantt-view-content">
      <IndentedTreeView
        outcomeTrees={[]}
        projectMeta={undefined}
        updateProjectMeta={function (
          entry: {
            name: string
            image: string
            isImported: boolean
            creatorAgentPubKey: string
            createdAt: number
            passphrase: string
            isMigrated: string
            layeringAlgorithm: LayeringAlgorithm
            topPriorityOutcomes: string[]
          },
          actionHash: string
        ): Promise<void> {
          throw new Error('Function not implemented.')
        }}
      />
      <div className="gantt-view-content-timeline">
        <GantViewTimeline />
      </div>
    </div>
  )
}

export default GanttViewContent
