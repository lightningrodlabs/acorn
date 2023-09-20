import { AppInfo, CellType } from '@holochain/client'
import React, { useEffect, useState } from 'react'
import { getAllApps } from '../../projectAppIds'
import { uidToPassphrase } from '../../secrets'
import Icon from '../Icon/Icon'
import './PendingProjects.scss'

type AppInfoDetails = {
  networkSeed: string
  appId: string
}
type AppInfoStore = {
  [cellId: string]: AppInfoDetails
}

function PendingProjects({}: {}) {
  const pendingProjectsCellIds = ['projectCellId', 'projectCellId2']
  const [expanded, setExpanded] = useState(false)
  const [passphrases, setPassphrases] = useState<AppInfoStore>({
    projectCellId: {
      appId: 'appid',
      networkSeed: 'uid-one-two-three-four-five',
    },
    projectCellId2: {
      appId: 'appid',
      networkSeed: 'uid-one-two-three-four-five',
    },
  })

  return (
    <>
      <div
        className={`pending-projects-for-sync-wrapper ${
          expanded ? 'pending-projects-expanded' : ''
        }`}
      >
        <div className="pending-projects-overview">
          <div className="pending-projects-summaries">
            <div className="pending-projects-summary syncing">
              {/* @ts-ignore */}
              <div className="pending-projects-summary-icon-syncing">
                <Icon
                  name="acorn-logo-syncing.svg"
                  className="not-hoverable small"
                />
              </div>
              {pendingProjectsCellIds.length}{' '}
              {pendingProjectsCellIds.length === 1 ? 'project' : 'projects'}{' '}
              syncing
            </div>
            <div className="pending-projects-summary waiting">
              {/* @ts-ignore */}
              <div className="pending-projects-summary-icon-waiting">
                <Icon
                  name="timer.svg"
                  className="not-hoverable small grey"
                />
              </div>
              {pendingProjectsCellIds.length}{' '}
              {pendingProjectsCellIds.length === 1 ? 'project' : 'projects'}{' '}
              waiting to sync
            </div>

            <div className="pending-projects-more-info-icon">
              {/* More info icon */}
              <div className="more-info-wrapper">
                <div>
                  <a
                    href="https://docs.acorn.software/projects/join-a-project"
                    target="_blank"
                  >
                    {/* @ts-ignore */}
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
              {pendingProjectsCellIds
                .filter((p: string) => !!passphrases[p])
                .map((pendingProjectCellId: string) => {
                  const appInfoDetails = passphrases[pendingProjectCellId]
                  return (
                    <div
                      className="pending-projects-details-item"
                      key={pendingProjectCellId}
                    >
                      <div className="pending-project-phrase-with-status">
                        <div className="pending-project-phrase">
                          {uidToPassphrase(appInfoDetails.networkSeed)}
                        </div>
                        <div className="pending-project-status-label peer-found">
                          syncing with found peer
                        </div>
                        <div className="pending-project-status-label peer-not-found">
                          no peer found
                        </div>
                      </div>
                      <div
                        className="pending-project-cancel-queue-button"
                        onClick={() => {}}
                      >
                        Cancel
                      </div>
                    </div>
                  )
                })}

              {/* <a
                href="https://sprillow.gitbook.io/acorn-knowledge-base/projects/join-a-project"
                target="_blank"
              >
                Having issues? Learn more about joining a project.
              </a> */}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default PendingProjects
