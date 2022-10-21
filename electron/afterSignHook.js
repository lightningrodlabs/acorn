require('dotenv').config()
const fs = require('fs')
const path = require('path')
const electronNotarize = require('electron-notarize')

module.exports = async function (params) {
  if (process.platform !== 'darwin') {
    return
  }

  console.log('afterSign hook triggered', params)

  const appId = 'org.lightningrodlabs.acorn'

  const appPath = path.join(
    params.appOutDir,
    `${params.packager.appInfo.productFilename}.app`
  )
  if (!fs.existsSync(appPath)) {
    console.log('skip')
    return
  }

  console.log(`Notarizing ${appId} found at ${appPath}`)

  try {
    await electronNotarize.notarize({
      appBundleId: appId,
      appPath: appPath,
      appleId: process.env.APPLE_ID_EMAIL,
      appleIdPassword: process.env.APPLE_ID_PASSWORD,
    })
  } catch (error) {
    console.error(error)
  }

  console.log(`Done notarizing ${appId}`)
}
