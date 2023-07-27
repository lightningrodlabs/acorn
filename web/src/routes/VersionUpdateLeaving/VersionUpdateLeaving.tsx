import React, { useEffect, useState } from 'react'

import './VersionUpdateLeaving.scss'

import exportProjectsData, {
  AllProjectsDataExport,
} from '../../migrating/export'
import { useStore } from 'react-redux'
import { useHistory } from 'react-router-dom'
import MigrationProgress from '../../components/MigrationProgress/MigrationProgress'

const checkIfExportNeeded = (currentVersion: string, toVersion: string) => {
  // compare
  // strings like: v2.1.0-alpha or 2.0.1-alpha

  // parseInt here extracts the "major" version number, which, if
  // it changes, means a migration is required
  return (
    parseInt(currentVersion.replace('v', '')) !==
    parseInt(toVersion.replace('v', ''))
  )
}

const persistExportedData = async (
  allProjectsDataExport: AllProjectsDataExport
) => {
  if (window.require) {
    const { ipcRenderer } = window.require('electron')
    await ipcRenderer.invoke(
      'persistExportData',
      JSON.stringify(allProjectsDataExport, null, 2)
    )
  }
}

const downloadNextVersion = async () => {
  if (window.require) {
    const { ipcRenderer } = window.require('electron')
    ipcRenderer.send('initiateUpdate')
    await new Promise<void>((resolve, reject) => {
      ipcRenderer.once('updateDownloaded', () => {
        console.log('finished downloading update')
        resolve()
      })
    })
  }
}

const markMigrationDone = () => {
  if (window.require) {
    const { ipcRenderer } = window.require('electron')
    ipcRenderer.send('markMigrationDone')
  }
}

export type VersionUpdateLeavingProps = {
  updateVersionInfo?: {
    currentVersion: string
    platform: string
    arch: string
    newReleaseVersion: string
    releaseNotes: string
    sizeForPlatform: string
  }
}

const VersionUpdateLeaving: React.FC<VersionUpdateLeavingProps> = ({
  updateVersionInfo,
}) => {
  // if not preRestart, then this is postRestart

  const store = useStore()
  const history = useHistory()

  const [hasStarted, setHasStarted] = useState(false)
  const [title, setTitle] = useState(
    'Preparing your update'
  )
  const [status, setStatus] = useState<string | React.ReactElement>('')
  // avoid 0 percent and 100 percent, just because of the component
  // that renders this value
  const [progress, setProgress] = useState(0.01) // percent

  const runExport = async () => {
    setStatus('Exporting your data.')
    const allExportData = await exportProjectsData(
      store,
      updateVersionInfo.newReleaseVersion,
      (completed, toComplete) => {
        // percent
        // the + 1 is because there's an additional step after
        setProgress(Math.floor((completed / (toComplete + 1)) * 100))
      }
    )
    // do the if check just in case the user is updating without ever having even created a profile
    // in which case we should skip it
    if (allExportData) {
      await persistExportedData(allExportData)
    }
  }

  const controlDownloadNextVersion = async () => {
    if (updateVersionInfo.platform === 'darwin') {
      setStatus('Now downloading the new version.')
      await downloadNextVersion()
      setProgress(99.9)
      // avoid 100 % because it does green checkmark
      setStatus(
        'The update has finished downloading. The app will restart shortly.'
      )
      // the electron side is going to trigger the app to quit and restart
    } else {
      setProgress(99.9)
      setTitle('Your update is prepared')
      setStatus(
        <>
          Currently only MacOS supports a fully auto-updating process. Please{' '}
          <a
            href={`https://github.com/lightningrodlabs/acorn/releases/${updateVersionInfo.newReleaseVersion}`}
            target="_blank"
          >
            click here to download the new release from Github
          </a>{' '}
          and install it to continue the update.{' '}
          <b>Quit this application before installing the new version.</b>
        </>
      )
    }
  }

  // initiation effect
  useEffect(() => {
    if (updateVersionInfo && !hasStarted) {
      setHasStarted(true)
      // first determine, is this a 'hard update' or a 'soft update',
      // meaning does it require migrating data between different integrity versions?
      if (
        checkIfExportNeeded(
          updateVersionInfo.currentVersion,
          updateVersionInfo.newReleaseVersion
        )
      ) {
        runExport().then(controlDownloadNextVersion)
      } else {
        controlDownloadNextVersion()
      }
    }
  }, [updateVersionInfo, hasStarted])

  return <MigrationProgress title={title} status={status} progress={progress} />
}

export default VersionUpdateLeaving
