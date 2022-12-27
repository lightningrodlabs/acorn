import { useEffect, useState } from 'react'

export default function useFileDownloaded() {
  const [fileDownloaded, setFileDownloaded] = useState(false)

  const subscribeToEvent = async () => {
    if (window.require) {
      const { ipcRenderer } = window.require('electron')
      ipcRenderer.once('exportDownloaded', () => {
        setFileDownloaded(true)
      })
    }
  }

  useEffect(() => {
    subscribeToEvent()
  }, [])

  return { fileDownloaded, setFileDownloaded }
}
