import { useEffect, useState } from 'react'

export default function useFileDownloaded() {
  const [fileDownloaded, setFileDownloaded] = useState(false)

  const subscribeToEvent = async () => {
    if (window.require) {
      const { ipcRenderer } = window.require('electron')
      ipcRenderer.on('exportDownloaded', () => {
        setFileDownloaded(true)
      })
    }
  }

  useEffect(() => {
    subscribeToEvent()
  }, [])

  return { fileDownloaded, setFileDownloaded }
}
