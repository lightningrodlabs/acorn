import { AppInfo } from '@holochain/client'
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

function PendingProjects({
  pendingProjects,
  fetchProjectMeta,
  setPendingProjects,
  deactivateApp,
}: {
  pendingProjects: string[]
  fetchProjectMeta: any
  setPendingProjects: React.Dispatch<React.SetStateAction<string[]>>
  deactivateApp: (appId: string, cellId: string) => Promise<void>
}) {
  const [expanded, setExpanded] = useState(false)
  const [passphrases, setPassphrases] = useState<AppInfoStore>({})

  // handle the regular checking for those projects
  // that haven't synced yet
  useEffect(() => {
    getAllApps().then((results) => {
      const newPassphrases: AppInfoStore = {}
      pendingProjects.forEach((pendingCellId) => {
        const [appId, appInfo] = Object.entries(results).find(
          ([_appId, appInfo]) => appInfo.cellIdString === pendingCellId
        )
        const cellInfo = Object.values(appInfo.cell_info)[0][0]
        const networkSeed =
          'Provisioned' in cellInfo
            ? cellInfo.Provisioned.dna_modifiers.network_seed
            : ''
        const appInfoForCellId = {
          networkSeed,
          appId,
        }
        newPassphrases[pendingCellId] = appInfoForCellId
      })
      setPassphrases(newPassphrases)
    })

    const checkAgainInterval = setInterval(async () => {
      const found = await Promise.all(
        pendingProjects.map(async (pendingProjectCellId) => {
          try {
            // fetchProjectMeta, if it succeeds
            // will automatically change the redux state since this
            // is a function wrapped in a dispatch call
            await fetchProjectMeta(pendingProjectCellId)
            return pendingProjectCellId
          } catch (e) {
            // project meta not found
            return false
          }
        })
      )
      // only keep the ones that still didn't
      // return a result
      setPendingProjects((pendingProjects: string[]) => {
        return pendingProjects.filter((c) => !found.find((ci) => c === ci))
      })
    }, 60000) // check every 60 seconds for project meta
    return () => {
      clearInterval(checkAgainInterval)
    }
  }, [JSON.stringify(pendingProjects)])

  const cancelProjectJoin = async (appId: string, cellId: string) => {
    await deactivateApp(appId, cellId)
    // remove this project from pendingProjects
    setPendingProjects((pendingProjects: string[]) => {
      return pendingProjects.filter((c) => c !== cellId)
    })
  }

  return (
    <>
      <div
        className={`pending-projects-for-sync-wrapper ${
          expanded ? 'pending-projects-expanded' : ''
        }`}
      >
        <div className="pending-projects-for-sync">
          <div className="pending-projects-for-sync-message-icon">
            {/* @ts-ignore */}
            <div className="pending-projects-syncing-icon">
              <Icon name="acorn-logo.svg" className="not-hoverable small" />
            </div>
            <div className="pending-projects-for-sync-message">
              {pendingProjects.length}{' '}
              {pendingProjects.length === 1 ? 'project' : 'projects'} queued for
              sync...
            </div>
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
              {pendingProjects
                .filter((p: string) => !!passphrases[p])
                .map((pendingProjectCellId: string) => {
                  const appInfoDetails = passphrases[pendingProjectCellId]
                  return (
                    <div
                      className="pending-projects-details-item"
                      key={pendingProjectCellId}
                    >
                      <div>{uidToPassphrase(appInfoDetails.networkSeed)}</div>
                      <div
                        className="pending-project-cancel-queue-button"
                        onClick={() =>
                          cancelProjectJoin(
                            appInfoDetails.appId,
                            pendingProjectCellId
                          )
                        }
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
