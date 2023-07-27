import React, { useEffect, useState } from 'react'

import './VersionUpdateEntering.scss'

import { useStore } from 'react-redux'
import importProjectsData from '../../migrating/import'
import { useHistory } from 'react-router-dom'
import MigrationProgress from '../../components/MigrationProgress/MigrationProgress'

const markMigrationDone = () => {
  if (window.require) {
    const { ipcRenderer } = window.require('electron')
    ipcRenderer.send('markMigrationDone')
  }
}

export type VersionUpdateEnteringProps = {
  migrationData?: string
}

const VersionUpdateEntering: React.FC<VersionUpdateEnteringProps> = ({
  migrationData,
}) => {

  const store = useStore()
  const history = useHistory()

  const [hasStarted, setHasStarted] = useState(false)
  const [title, setTitle] = useState('Finishing your update')
  const [status, setStatus] = useState<string | React.ReactElement>('')
  // avoid 0 percent and 100 percent, just because of the component
  // that renders this value
  const [progress, setProgress] = useState(0.01) // percent

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

  // initiation effect
  useEffect(() => {
    if (migrationData && !hasStarted) {
      setHasStarted(true)
      runImport()
    }
  }, [migrationData])

  return (
    <MigrationProgress title={title} status={status} progress={progress} />
  )
}

export default VersionUpdateEntering
