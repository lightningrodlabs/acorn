import { useEffect, useState } from 'react'


const findGithubAssetForPlatformArch = (platform: string, arch: string) => (asset: any) => {
  if (platform === 'darwin') {
    if (arch === 'arm64') {
      return asset.name.includes('mac-arm64')
    } else {
      return (
        asset.name.includes('mac') && !asset.name.includes('arm64')
      )
    }
  } else if (platform === 'win32') {
    return asset.name.includes('.exe')
  } else if (platform === 'linux') {
    return asset.name.includes('.AppImage')
  }
}

export default function useVersionChecker(): {
  currentVersion: string
  platform: string
  arch: string
  name: string
  releaseNotes: string
  sizeForPlatform: string
} {
  const [currentVersion, setCurrentVersion] = useState('')
  const [platform, setPlatform] = useState('')
  const [arch, setArch] = useState('')
  const [name, setName] = useState('')
  const [releaseNotes, setReleaseNotes] = useState('')
  const [sizeForPlatform, setSizeForPlatform] = useState('')

  useEffect(() => {
    if (window.require) {
      window
        .require('electron')
        .ipcRenderer.invoke('getVersion')
        .then(
          (currentVersionInfo: {
            version: string
            platform: string
            arch: string
          }) => {
            setCurrentVersion(currentVersionInfo.version)
            setPlatform(currentVersionInfo.platform)
            setArch(currentVersionInfo.arch)
          }
        )
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
            const asset = latestRelease.assets.find(findGithubAssetForPlatformArch(platform, arch))
            if (asset) {
              // math for bytes -> megabytes
              setSizeForPlatform(`${Math.floor(0.000001 * asset.size)}mb`)
            }
          }
        })
        .catch((e) => {
          console.log('could not check for updates. likely cause is no internet connectivity')
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
  }, [currentVersion, platform, arch])

  return name
    ? {
        currentVersion,
        platform,
        arch,
        name,
        releaseNotes,
        sizeForPlatform,
      }
    : null
}
