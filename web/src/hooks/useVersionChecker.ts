import { useEffect, useState } from 'react'

export default function useVersionChecker(): {
  currentVersion: string
  name: string
  releaseNotes: string
  sizeForPlatform: string
} {
  const [currentVersion, setCurrentVersion] = useState('')
  const [name, setName] = useState('')
  const [releaseNotes, setReleaseNotes] = useState('')
  const [sizeForPlatform, setSizeForPlatform] = useState('')

  useEffect(() => {
    if (window.require) {
      window
        .require('electron')
        .ipcRenderer.invoke('getVersion')
        .then((version: string) => {
          setCurrentVersion(version)
        })
    }
  }, [])

  useEffect(() => {
    // every 10 minutes, fetch from github releases
    // to see if there is any new update available for the app
    const checkForGithubUpdates = () => {
      fetch('https://api.github.com/repos/lightningrodlabs/acorn/releases')
        .then((response) => response.json())
        .then((releases) => {
          // 0 index is the latest
          const latestRelease = releases[0]
          const latestTagName = latestRelease.tag_name
          const latestReleaseNotes = latestRelease.body
          if (currentVersion && latestTagName !== currentVersion) {
            clearInterval(timerID)
            setName(latestTagName)
            setReleaseNotes(latestReleaseNotes)
            // TODO
            setSizeForPlatform('1mb')
          }
        })
    }
    // check every 10 minutes
    const timerID = setInterval(checkForGithubUpdates, 1000 * 60 * 10)
    checkForGithubUpdates()
    return () => {
      // this function will be called
      // when this component unmounts:
      // 'tear down the timer'
      clearInterval(timerID)
    }
  }, [currentVersion])

  return name ? {
    currentVersion,
    name,
    releaseNotes,
    sizeForPlatform,
  } : null
}
