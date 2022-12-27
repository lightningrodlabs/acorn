import React, { useEffect, useState } from 'react'

import './RunUpdate.scss'

// @ts-ignore
import AcornLogo from '../../images/acorn-logo.svg'
import ProgressIndicator from '../../components/ProgressIndicator/ProgressIndicator'
import Typography from '../../components/Typography/Typography'
import exportProjectsData, {
  AllProjectsDataExport,
} from '../../migrating/export'
import { useStore } from 'react-redux'
import importProjectsData from '../../migrating/import'
import { useHistory } from 'react-router-dom'

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

export type RunUpdateProps = {
  preRestart?: boolean
  // for pre restart
  updateVersionInfo?: {
    currentVersion: string
    platform: string
    arch: string
    name: string
    releaseNotes: string
    sizeForPlatform: string
  }
  // for post restart
  migrationData?: string
}

const RunUpdate: React.FC<RunUpdateProps> = ({
  preRestart,
  updateVersionInfo,
  migrationData,
}) => {
  // if not preRestart, then this is postRestart

  const store = useStore()
  const history = useHistory()

  const [title, setTitle] = useState(
    preRestart ? 'Preparing your update' : 'Finishing your update'
  )
  const [status, setStatus] = useState<string | React.ReactElement>('')
  // avoid 0 percent and 100 percent, just because of the component
  // that renders this value
  const [progress, setProgress] = useState(0.01) // percent

  const runExport = async () => {
    setStatus('Exporting your data.')
    const allExportData = await exportProjectsData(
      store,
      updateVersionInfo.name,
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
            href={`https://github.com/lightningrodlabs/acorn/releases/${updateVersionInfo.name}`}
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

  const runImport = async () => {
    setStatus('Importing your data.')
    await importProjectsData(store, migrationData, (completed, toComplete) => {
      // percent
      // avoid 100 % because it does green checkmark
      let newProgress = Math.floor((completed / toComplete) * 100)
      if (newProgress === 100) {
        newProgress = 99.9
      }
      setProgress(newProgress)
    })
    markMigrationDone()
    setTitle('Finished your update')
    setStatus(
      'Your data was imported, you are ready to go! You will be redirected in a moment.'
    )
    setTimeout(() => {
      history.push('/dashboard')
    }, 4000)
  }

  // on component mount, initiate
  useEffect(() => {
    if (preRestart) {
      // first determine, is this a 'hard update' or a 'soft update',
      // meaning does it require migrating data between different integrity versions?
      if (
        checkIfExportNeeded(
          updateVersionInfo.currentVersion,
          updateVersionInfo.name
        )
      ) {
        runExport().then(controlDownloadNextVersion)
      } else {
        controlDownloadNextVersion()
      }
    } else {
      runImport()
    }
  }, [])

  return (
    <div className="run-update-screen-wrapper">
      <div className="run-update-screen">
        <div className="run-update-circle-with-logo">
          <div className="run-update-circle">
            <ProgressIndicator progress={progress} />
          </div>
          <div className="run-update-rotating-logo">
            <img src={AcornLogo} />
          </div>
        </div>
        <div className="run-update-screen-heading">
          <Typography style={'h3'}>{title}</Typography>
        </div>
        <div className="run-update-screen-subheading">
          <Typography style={'body1'}>{status}</Typography>
        </div>
      </div>
    </div>
  )
}

export default RunUpdate
