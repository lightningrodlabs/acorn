import { useEffect, useState } from 'react'

const findGithubAssetForPlatformArch = (platform: string, arch: string) => (
  asset: any
) => {
  if (platform === 'darwin') {
    if (arch === 'arm64') {
      return asset.name.includes('darwin-arm64')
    } else {
      return asset.name.includes('darwin') && !asset.name.includes('arm64')
    }
  } else if (platform === 'win32') {
    return asset.name.includes('.exe')
  } else if (platform === 'linux') {
    return asset.name.includes('.AppImage')
  }
}

const checkForGithubUpdates = async (
  currentVersion: string,
  platform: string,
  arch: string
) => {
  try {
    const response = await fetch(
      'https://api.github.com/repos/lightningrodlabs/acorn/releases'
    )
    const releases = await response.json()
    // 0 index is the latest
    const latestRelease = releases[0]
    const latestTagName = latestRelease.tag_name
    const latestReleaseNotes = latestRelease.body
    if (isVersionOutOfDate(currentVersion, latestTagName)) {
      // clearInterval(timerID)
      const asset = latestRelease.assets.find(
        findGithubAssetForPlatformArch(platform, arch)
      )
      if (!asset) {
        throw new Error(`could not find asset for platform ${platform} + arch ${arch}`)
      }
      return {
        name: latestTagName,
        releaseNotes: latestReleaseNotes,
        // math for bytes -> megabytes
        sizeForPlatform: `${Math.floor(0.000001 * asset.size)}mb`,
      }
    } else {
      return null
    }
  } catch (e) {
    console.log(
      'could not check for updates. likely cause is no internet connectivity. here is the error:',
      e
    )
    return null
  }
}

function isVersionOutOfDate(
  currentVersion: string,
  latestVersion: string
): boolean {
  const versionPattern: RegExp = /^\d+\.\d+\.\d+$/

  currentVersion = currentVersion.substring(
    currentVersion.indexOf('v') + 1,
    currentVersion.lastIndexOf('-')
  )
  latestVersion = latestVersion.substring(
    latestVersion.indexOf('v') + 1,
    latestVersion.lastIndexOf('-')
  )

  // we can't be sure that we are out of date if the version
  // is not in the correct format
  if (
    !versionPattern.test(currentVersion) ||
    !versionPattern.test(latestVersion)
  )
    return false

  const currentVersionParts = currentVersion.split('.')
  const latestVersionParts = latestVersion.split('.')
  if (currentVersionParts[0] < latestVersionParts[0]) {
    return true
  } else if (currentVersionParts[0] === latestVersionParts[0]) {
    if (currentVersionParts[1] < latestVersionParts[1]) {
      return true
    } else if (currentVersionParts[1] === latestVersionParts[1]) {
      if (currentVersionParts[2] < latestVersionParts[2]) {
        return true
      }
    }
  }
  return false
}

export default function useVersionChecker(
  isTest?: boolean
): {
  currentVersion: string
  integrityVersion: number
  platform: string
  arch: string
  newReleaseVersion: string
  releaseNotes: string
  sizeForPlatform: string
} {
  const [currentVersion, setCurrentVersion] = useState('')
  const [integrityVersion, setIntegrityVersion] = useState<number>(null)
  const [platform, setPlatform] = useState('')
  const [arch, setArch] = useState('')
  const [newReleaseVersion, setNewReleaseVersion] = useState('')
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
            integrityVersion: number
            platform: string
            arch: string
          }) => {
            setCurrentVersion(currentVersionInfo.version)
            setIntegrityVersion(currentVersionInfo.integrityVersion)
            setPlatform(currentVersionInfo.platform)
            setArch(currentVersionInfo.arch)
          }
        )
    }
  }, [])

  // every 10 minutes, fetch from github releases
  // to see if there is any new update available for the app
  useEffect(() => {
    if (isTest) {
      setNewReleaseVersion('v12.0.0')
      setReleaseNotes('release notes')
      setSizeForPlatform('1mb')
      return
    }
    const check = () => {
      checkForGithubUpdates(currentVersion, platform, arch).then((update) => {
        if (update) {
          clearInterval(timerID)
          setNewReleaseVersion(update.name)
          setReleaseNotes(update.releaseNotes)
          setSizeForPlatform(update.sizeForPlatform)
        }
      })
    }
    // check every 10 minutes
    const timerID = setInterval(check, 1000 * 60 * 10)
    check()
    return () => {
      clearInterval(timerID)
    }
  }, [isTest, currentVersion, platform, arch])

  return newReleaseVersion
    ? {
        currentVersion,
        integrityVersion,
        platform,
        arch,
        newReleaseVersion,
        releaseNotes,
        sizeForPlatform,
      }
    : null
}
