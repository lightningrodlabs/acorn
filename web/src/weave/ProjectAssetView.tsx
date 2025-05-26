import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { WAL } from '@theweave/api'
import { encodeHashToBase64 } from '@holochain/client'
import { hrlToString } from '@holochain-open-dev/utils'
import { CellIdString, ActionHashB64 } from '../types/shared'
import { getAppWs } from '../hcWebsockets'
import { AcornState } from './acornState'
import { setActiveProject } from '../redux/ephemeral/active-project/actions'
import AppWebsocketContext from '../context/AppWebsocketContext'
import ProjectViewWrapper from '../routes/ProjectView/ProjectView.connector'
import constructProjectDataFetchers from '../api/projectDataFetchers'

interface ProjectAssetViewProps {
  wal: WAL
}

const ProjectAssetView: React.FC<ProjectAssetViewProps> = ({ wal }) => {
  const [projectId, setProjectId] = useState<CellIdString | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [appWs, setAppWs] = useState<any>(null)
  const dispatch = useDispatch()

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
        const projectInfo = acornState.findProjectByActionHashB64(actionHashB64)

        if (projectInfo) {
          const determinedProjectId = projectInfo.cellIdWrapper.getCellIdString()
          setProjectId(determinedProjectId)

          // Set the active project ID in Redux state
          dispatch(setActiveProject(determinedProjectId))

          // Construct fetchers for this project
          const fetchers = constructProjectDataFetchers(
            dispatch,
            determinedProjectId
          )

          // Fetch all project data needed
          console.log(
            `ProjectAssetView: Fetching all data for project ${determinedProjectId}`
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
            `ProjectAssetView: Finished fetching all data for project ${determinedProjectId}`
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

  if (projectId) {
    return (
      <AppWebsocketContext.Provider value={appWs}>
        <ProjectViewWrapper />
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
