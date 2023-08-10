import React, { useEffect, useState } from 'react'

import './VersionUpdateEntering.scss'

import { useStore } from 'react-redux'
import importProjectsData from '../../migrating/import/import'
import { useHistory } from 'react-router-dom'
import MigrationProgress from '../../components/MigrationProgress/MigrationProgress'
import { RootState } from '../../redux/reducer'
import ButtonAction from '../../components/ButtonAction/ButtonAction'
import ExportMenuItem from '../../components/ExportMenuItem/ExportMenuItem.component'

const markMigrationDone = () => {
  if (window.require) {
    const { ipcRenderer } = window.require('electron')
    ipcRenderer.send('markMigrationDone')
  }
}

export type VersionUpdateEnteringProps = {
  hasCheckedForMigration: boolean
  migrationData?: string
  migrationDataFileName?: string
}

const VersionUpdateEntering: React.FC<VersionUpdateEnteringProps> = ({
  hasCheckedForMigration,
  migrationData,
  migrationDataFileName,
}) => {
  const store = useStore()
  const history = useHistory()
  const state: RootState = store.getState()
  const profilesCellId = state.cells.profiles
  const hasFetchedForWhoami = state.ui.hasFetchedForWhoami
  const whoami = state.whoami

  const [hasStarted, setHasStarted] = useState(false)
  const [title, setTitle] = useState('Finishing your update')
  const [status, setStatus] = useState<string | React.ReactElement>('')
  // avoid 0 percent and 100 percent, just because of the component
  // that renders this value
  const [progress, setProgress] = useState(0.01) // percent
  const [showActions, setShowActions] = useState(false)
  const [abandoningMigration, setAbandoningMigration] = useState(false)

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
    // we need to wait for the profiles cell to be known
    if (hasFetchedForWhoami) {
      if (whoami && migrationData) {
        setTitle('Migration warning')
        setStatus(
          <>
            Although your user data indicates a migration is needed, you also
            appear to have a profile already. You need to choose your preferred
            action. Keeping your data is the safest option.
          </>
        )
        setShowActions(true)
      } else if (profilesCellId && migrationData && !hasStarted) {
        setHasStarted(true)
        runImport().catch((e) => {
          console.error(e)
          setTitle('Error')
          setStatus(
            'There was an error importing your data. Please contact support by opening a Github Issue.'
          )
        })
      }
    }
  }, [migrationData, profilesCellId, hasFetchedForWhoami, whoami])

  // if we have no migration data, we can just redirect
  useEffect(() => {
    if (hasCheckedForMigration && !migrationData) {
      history.push('/dashboard')
    }
  }, [hasCheckedForMigration, migrationData])

  const abandonMigration = () => {
    // deletes the migration file from the filesystem
    // but they can still choose to keep a copy of it,
    // because we have that in local memory here, as `migrationData`
    markMigrationDone()
    setTitle('Abandon Migration')
    setStatus(`
    You've chosen to abandon migration and keep your current versions' data.
    As a precautionary measure, you can choose to keep a copy of your migration data.
    `)
    setAbandoningMigration(true)
  }
  const finishAbandonMigration = async () => {
    history.push('/dashboard')
  }
  const resetDataAndMigrate = async () => {
    if (window.require) {
      const { ipcRenderer } = window.require('electron')
      ipcRenderer.send('factoryResetWithWarning')
    }
  }

  const actionButtons = (
    <div className="migration-actions">
      {abandoningMigration && (
        <ExportMenuItem
          title={'Download a copy of my migration data'}
          downloadFilename={migrationDataFileName}
          type="json"
          data={migrationData}
          onClick={finishAbandonMigration}
        />
      )}
      <div className="button-group">
        {!abandoningMigration && (
          <>
            <ButtonAction
              size={'small'}
              onClick={abandonMigration}
              icon={undefined}
              text={'Abandon migration and keep my data'}
            />
            <ButtonAction
              size={'small'}
              onClick={resetDataAndMigrate}
              icon={undefined}
              text={'Reset my data and migrate'}
            />
          </>
        )}
        {abandoningMigration && (
          <>
            <ButtonAction
              size={'small'}
              onClick={finishAbandonMigration}
              icon={undefined}
              text={'Continue to Dashboard without downloading'}
            />
          </>
        )}
      </div>
    </div>
  )

  return (
    <>
      <MigrationProgress
        title={title}
        status={status}
        progress={progress}
        actionButtons={showActions ? actionButtons : null}
      />
    </>
  )
}

export default VersionUpdateEntering
