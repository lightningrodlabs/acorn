import { InstalledAppInfo } from '@holochain/conductor-api'
import React, { useEffect, useState } from 'react'
import { getAllApps } from '../../projectAppIds'
import { uidToPassphrase } from '../../secrets'
import Icon from '../Icon/Icon'
import './PendingProjects.css'

type AppInfoDetails = {
  uid: string
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
    getAllApps().then(
      (results: {
        [app_id: string]: InstalledAppInfo & { cellIdString: string }
      }) => {
        const newPassphrases: AppInfoStore = {}
        pendingProjects.forEach((pendingCellId) => {
          const [appId, appInfo] = Object.entries(results).find(
            ([_appId, appInfo]) => appInfo.cellIdString === pendingCellId
          )
          const appInfoForCellId = {
            uid: appInfo.cell_data[0].cell_nick,
            appId,
          }
          newPassphrases[pendingCellId] = appInfoForCellId
        })
        setPassphrases(newPassphrases)
      }
    )

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
    }, 60000)
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
            <Icon
              name="acorn-logo-stroked.svg"
              className="not-hoverable very-small grey"
            />
            <div className="pending-projects-for-sync-message">
              {pendingProjects.length}{' '}
              {pendingProjects.length === 1 ? 'project' : 'projects'} queued for
              sync...
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
                      <div>{uidToPassphrase(appInfoDetails.uid)}</div>
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
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default PendingProjects
