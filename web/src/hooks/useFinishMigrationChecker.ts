import { useEffect, useState } from 'react'

export default function useFinishMigrationChecker(): {
  triggerACheck: () => Promise<void>
  hasChecked: boolean
  migrationDataFileName: string
  dataForNeedsMigration: string
} {
  const [hasChecked, setHasChecked] = useState(false)
  const [migrationDataFileName, setMigrationDataFileName] = useState('')
  const [dataForNeedsMigration, setDataForNeedsMigration] = useState('')

  const triggerACheck = async () => {
    setHasChecked(false)
    if (window.require) {
      const migrationData: {
        data: string
        file: string
      } | null = await window
        .require('electron')
        .ipcRenderer.invoke('checkForMigrationData')
      console.log('migrationData', migrationData)
      if (migrationData) {
        setDataForNeedsMigration(migrationData.data)
        setMigrationDataFileName(migrationData.file)
      }
      setHasChecked(true)
    } else {
      // mock here if we want to test
      setHasChecked(true)
    }
  }

  useEffect(() => {
    triggerACheck()
  }, [])

  return {
    triggerACheck,
    hasChecked,
    migrationDataFileName,
    dataForNeedsMigration,
  }
}
