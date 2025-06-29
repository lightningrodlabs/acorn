import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { WAL, isWeaveContext } from '@theweave/api'
import { encodeHashToBase64, EntryHash } from '@holochain/client'
import { hrlToString } from '@holochain-open-dev/utils'
import { CellIdString } from '../types/shared'
import { getAppWs, getWeaveClient } from '../hcWebsockets'
import { AcornState } from './acornState'
import { setActiveProject } from '../redux/ephemeral/active-project/actions'
import AppWebsocketContext from '../context/AppWebsocketContext'
import ProjectViewWrapper from '../routes/ProjectView/ProjectView.connector'
import constructProjectDataFetchers from '../api/projectDataFetchers'
import { HashRouter as Router, Switch, Route, Redirect } from 'react-router-dom'
import HeaderLeftPanel from '../components/Header/HeaderLeftPanel'
import { useProjectAttachments } from '../hooks/useProjectAttachments'
import { CellIdWrapper } from '../domain/cellId'
import './ProjectAssetView.scss'
import { WireRecord } from '../api/hdkCrud'
import { Profile } from 'zod-models'

interface ProjectAssetViewProps {
  wal: WAL
}

const ProjectAssetView: React.FC<ProjectAssetViewProps> = ({ wal }) => {
  const [projectId, setProjectId] = useState<CellIdString | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [appWs, setAppWs] = useState<any>(null)
  const [projectMeta, setProjectMeta] = useState<any>(null)
  const dispatch = useDispatch()

  // Get project attachments
  const { attachmentsInfo } = useProjectAttachments({
    projectId,
    projectMeta,
  })

  // Main effect for fetching initial data based on WAL
  useEffect(() => {
    const fetchProjectData = async () => {
      setLoading(true)
      setError(null)
      try {
        // The WAL contains [DnaHash, EntryHash | ActionHash]
        // For projects, the second element is the ActionHash of the ProjectMeta
        const [dnaHash, actionHash] = wal.hrl
        if (!actionHash) {
          throw new Error('Invalid WAL structure: ActionHash missing.')
        }
        const actionHashB64 = encodeHashToBase64(actionHash)

        const appWs = await getAppWs()
        if (!appWs) throw new Error('AppClient not available.')
        setAppWs(appWs)

        const acornState = await AcornState.fromAppClient(appWs)
        const projectId = acornState.getProjectIdByActionHashB64(actionHashB64)
        const projectMeta = acornState.findProjectMetaByActionHashB64(
          actionHashB64
        )
        console.log(
          `ProjectAssetView: Found project ID ${projectId} for ActionHash ${actionHashB64}`,
          projectMeta
        )

        if (projectId) {
          setProjectId(projectId)
          setProjectMeta(projectMeta)

          // Set the active project ID in Redux state
          dispatch(setActiveProject(projectId))

          // Construct fetchers for this project
          const fetchers = constructProjectDataFetchers(dispatch, projectId)

          // Fetch all project data needed
          console.log(
            `ProjectAssetView: Fetching all data for project ${projectId}`
          )

          // Fetch data concurrently
          await Promise.all([
            fetchers.fetchProjectMeta(),
            fetchers.fetchOutcomes(),
            fetchers.fetchConnections(),
            fetchers.fetchOutcomeMembers(),
            fetchers.fetchTags(),
            fetchers.fetchEntryPoints(),
            fetchers.fetchMembers(),
            fetchers.fetchOutcomeComments(),
          ])

          console.log(
            `ProjectAssetView: Finished fetching all data for project ${projectId}`
          )
        } else {
          throw new Error(`Project with ActionHash ${actionHashB64} not found.`)
        }
      } catch (e) {
        console.error('Error fetching project data:', e)
        setError(e.message || 'Failed to load project details.')
      } finally {
        setLoading(false)
      }
    }

    if (wal) {
      fetchProjectData()
    }
  }, [wal, dispatch])

  if (loading) {
    return <div>Loading Project Data...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  // Add attachment function
  const handleAddAttachment = async () => {
    if (!isWeaveContext() || !projectId || !projectMeta) return

    const weaveClient = getWeaveClient()
    if (!weaveClient) return

    const cellIdWrapper = CellIdWrapper.fromCellIdString(projectId)
    const thisWal: WAL = {
      hrl: [cellIdWrapper.getDnaHash(), projectMeta.actionHash],
    }

    const wal = await weaveClient.assets.userSelectAsset()
    if (wal) {
      await weaveClient.assets.addAssetRelation(thisWal, wal)
    }
  }

  // Remove attachment function
  const handleRemoveAttachment = async (relationHash: EntryHash) => {
    if (!isWeaveContext()) return

    const weaveClient = getWeaveClient()
    if (!weaveClient) return

    await weaveClient.assets.removeAssetRelation(relationHash)
  }

  // Function to open asset
  const openAsset = async (wal: WAL) => {
    if (!isWeaveContext()) return

    const weaveClient = getWeaveClient()
    if (weaveClient) {
      await weaveClient.openAsset(wal)
    }
  }

  if (projectId) {
    return (
      <AppWebsocketContext.Provider value={appWs}>
        <div className="project-asset-view">
          <Router>
            <div className="header-wrapper">
              <div className="header">
                <HeaderLeftPanel
                  myLocalProfile={{} as Profile}
                  members={[]}
                  presentMembers={[]}
                  projectName={projectMeta ? projectMeta.entry.name : ''}
                  projectPassphrase={
                    projectMeta ? projectMeta.entry.passphrase : ''
                  }
                  activeEntryPoints={[]}
                  setModalState={() => {}}
                  goToOutcome={() => {}}
                  projectMeta={projectMeta}
                  attachmentsInfo={attachmentsInfo}
                  handleAddAttachment={handleAddAttachment}
                  handleRemoveAttachment={handleRemoveAttachment}
                  openAsset={openAsset}
                  showOnlyProjectSection={true}
                />
              </div>
            </div>
            <Switch>
              <Route
                path="/project/:projectId"
                render={() => <ProjectViewWrapper />}
              />
              <Route
                path="/"
                render={() => <Redirect to={`/project/${projectId}/table`} />}
              />
            </Switch>
          </Router>
        </div>
      </AppWebsocketContext.Provider>
    )
  }

  // Fallback if projectId couldn't be determined
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>Project View</h2>
      <p>The project details could not be loaded.</p>
      <p style={{ color: '#666', fontSize: '0.9em', overflow: 'scroll' }}>
        Project ID: {hrlToString(wal.hrl)}
      </p>
    </div>
  )
}

export default ProjectAssetView
