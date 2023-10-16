import React, { useState } from 'react'
import Icon from '../Icon/Icon'
import './PendingProjects.scss'
import { CellIdString } from '../../types/shared'
import { ProjectStatusInfos } from '../../hooks/useProjectStatusInfos'

export type PendingProjectsProps = {
  projectStatusInfos: ProjectStatusInfos
  setProjectStatusInfos: React.Dispatch<React.SetStateAction<ProjectStatusInfos>>
  uninstallProject: (appId: string, cellId: CellIdString) => Promise<void>
}

enum OverviewPillType {
  Syncing,
  Waiting,
}
function ProjectOverviewPill({
  count,
  overviewPillType,
}: {
  count: number
  overviewPillType: OverviewPillType
}) {
  const className =
    overviewPillType === OverviewPillType.Syncing ? 'syncing' : 'waiting'
  const iconClassname =
    overviewPillType === OverviewPillType.Syncing
      ? 'pending-projects-summary-icon-syncing'
      : 'pending-projects-summary-icon-waiting'
  const iconName =
    overviewPillType === OverviewPillType.Syncing
      ? 'acorn-logo-syncing.svg'
      : 'timer.svg'
  const text =
    overviewPillType === OverviewPillType.Syncing
      ? 'syncing'
      : 'waiting to sync'
  return (
    <div className={`pending-projects-summary ${className}`}>
      <div className={iconClassname}>
        <Icon name={iconName} className="not-hoverable small" />
      </div>
      {count} {count === 1 ? 'project' : 'projects'} {text}
    </div>
  )
}

function PendingProjects({
  projectStatusInfos,
  setProjectStatusInfos,
  uninstallProject,
}: PendingProjectsProps) {
  const [expanded, setExpanded] = useState(false)
  const pendingCellIds = Object.keys(projectStatusInfos).filter((cellId) => {
    const projectInfo = projectStatusInfos[cellId]
    return !projectInfo.hasProjectMeta
  })
  if (pendingCellIds.length === 0) {
    return null
  }
  const syncingProjectsCount = pendingCellIds.filter((cellId) => {
    const projectInfo = projectStatusInfos[cellId]
    return projectInfo.hasPeers
  }).length
  const waitingProjectsCount = pendingCellIds.filter((cellId) => {
    const projectInfo = projectStatusInfos[cellId]
    return !projectInfo.hasPeers
  }).length

  const cancelProjectJoin = async (appId: string, cellId: string) => {
    await uninstallProject(appId, cellId)
    // remove this project from pendingProjects
    setProjectStatusInfos((pendingProjects: ProjectStatusInfos) => {
      const { [cellId]: _, ...rest } = pendingProjects
      return rest
    })
  }

  return (
    <>
      <div
        className={`pending-projects-for-sync-wrapper ${
          expanded ? 'pending-projects-expanded' : ''
        }`}
      >
        <div className="pending-projects-overview">
          <div className="pending-projects-summaries">
            {syncingProjectsCount > 0 && (
              <ProjectOverviewPill
                count={syncingProjectsCount}
                overviewPillType={OverviewPillType.Syncing}
              />
            )}
            {waitingProjectsCount > 0 && (
              <ProjectOverviewPill
                count={waitingProjectsCount}
                overviewPillType={OverviewPillType.Waiting}
              />
            )}
            <div className="pending-projects-more-info-icon">
              {/* More info icon */}
              <div className="more-info-wrapper">
                <div>
                  <a
                    href="https://docs.acorn.software/projects/join-a-project"
                    target="_blank"
                  >
                    <Icon name="info.svg" className="light-grey" size="small" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div
            className="pending-projects-for-sync-button"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? 'Hide' : 'Show'} details
          </div>
        </div>
        <div className="pending-projects-details-wrapper">
          {expanded && (
            <div>
              {pendingCellIds.map((pendingProjectCellId) => {
                const pendingProject = projectStatusInfos[pendingProjectCellId]
                return (
                  <div
                    className="pending-projects-details-item"
                    key={pendingProjectCellId}
                  >
                    <div className="pending-project-phrase-with-status">
                      <div className="pending-project-phrase">
                        {pendingProject.passphrase}
                      </div>
                      {pendingProject.hasPeers && (
                        <div className="pending-project-status-label peer-found">
                          syncing with found peer
                        </div>
                      )}
                      {!pendingProject.hasPeers && (
                        <div className="pending-project-status-label peer-not-found">
                          no peers found
                        </div>
                      )}
                    </div>
                    {/* Cancel (Uninstall) */}
                    <div
                      className="pending-project-cancel-queue-button"
                      onClick={() =>
                        cancelProjectJoin(
                          pendingProject.appId,
                          pendingProjectCellId
                        )
                      }
                    >
                      Cancel
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default PendingProjects
