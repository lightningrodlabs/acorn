import { useEffect, useState } from 'react'

export default function useFinishMigrationChecker(): {
  hasChecked: boolean
  dataForNeedsMigration: string
} {
  const [hasChecked, setHasChecked] = useState(false)
  const [dataForNeedsMigration, setDataForNeedsMigration] = useState('')

  useEffect(() => {
    if (window.require) {
      window
        .require('electron')
        .ipcRenderer.invoke('checkForMigrationData')
        .then((migrationData: string) => {
          console.log('migrationData', migrationData)
          setDataForNeedsMigration(migrationData)
          setHasChecked(true)
        })
    } else {
      setHasChecked(true)
    }
  }, [])

  return {
    hasChecked,
    dataForNeedsMigration,
  }
}
