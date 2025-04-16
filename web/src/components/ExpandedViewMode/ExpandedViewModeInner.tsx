import React from 'react'
import EVMiddleColumn from './EVMiddleColumn/EVMiddleColumn'
import EVLeftColumn from './EVLeftColumn/EVLeftColumn'
import { ExpandedViewTab } from './NavEnum'
import { CellIdString, ActionHashB64 } from '../../types/shared'
import { ComputedOutcome } from '../../types'
import hashCodeId from '../../api/clientSideIdHash'

// Props needed specifically by the inner layout
export type ExpandedViewModeInnerProps = {
  projectId: CellIdString
  outcome: ComputedOutcome
  outcomeActionHash: ActionHashB64
  activeTab: ExpandedViewTab
  setActiveTab: (tab: ExpandedViewTab) => void
  commentCount: number
  details: React.ReactElement
  comments: React.ReactElement
  childrenList: React.ReactElement
  taskList: React.ReactElement
  rightColumn: React.ReactElement
  attachments?: React.ReactElement
  // Removed: onClose (handled by wrapper), renderAsModal (handled by parent)
  // Removed: outcomeAndAncestors (needed by wrapper for breadcrumbs)
  // Removed: openExpandedView (needed by wrapper for breadcrumbs)
}

const ExpandedViewModeInner: React.FC<ExpandedViewModeInnerProps> = ({
  projectId,
  outcome,
  outcomeActionHash,
  activeTab,
  setActiveTab,
  commentCount,
  details,
  comments,
  childrenList,
  taskList,
  rightColumn,
  attachments,
}) => {
  const outcomeId = hashCodeId(outcomeActionHash)

  // if not small, then show children list icon on left menu
  const showChildrenListMenuItem = outcome && !('Small' in outcome.scope)
  const childrenCount =
    outcome && outcome.children ? outcome.children.length : 0

  // if small, then show task list icon on left menu
  const showTaskListMenuItem =
    childrenCount === 0 && outcome && 'Small' in outcome.scope
  const taskListCount =
    childrenCount === 0 && outcome && 'Small' in outcome.scope
      ? outcome.scope.Small.taskList.length
      : 0

  const attachmentsCount = attachments?.props.attachmentsInfo?.length || 0

  return (
    <>
      {/* Close button is now rendered by the modal wrapper */}
      {/* {renderAsModal && <ButtonClose onClick={onClose} size="medium" />} */}
      <EVLeftColumn
        activeTab={activeTab}
        onChange={setActiveTab}
        commentCount={commentCount}
        showChildrenList={showChildrenListMenuItem}
        childrenCount={childrenCount}
        showTaskList={showTaskListMenuItem}
        taskListCount={taskListCount}
        outcomeId={outcomeId}
        attachmentsNumber={attachmentsCount}
      />
      <div className="expanded-view-tab-view-wrapper">
        <EVMiddleColumn
          activeTab={activeTab}
          outcome={outcome}
          projectId={projectId}
          details={details}
          comments={comments}
          childrenList={childrenList}
          taskList={taskList}
          attachments={attachments}
          // Pass rightColumn down to MiddleColumn
          rightColumn={rightColumn}
        />
        {/* rightColumn is now rendered inside EvDetails (via EVMiddleColumn) */}
      </div>
    </>
  )
}

export default ExpandedViewModeInner
