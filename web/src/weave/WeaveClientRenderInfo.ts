import { ProfilesClient } from '@holochain-open-dev/profiles'
import { AppClient } from '@holochain/client'
import { RenderInfo, WAL } from '@theweave/api'

export class WeaveClientRenderInfo {
  renderInfo: RenderInfo
  constructor(renderInfo: RenderInfo) {
    this.renderInfo = renderInfo
  }

  isAppletView(): boolean {
    return this.renderInfo.type === 'applet-view'
  }

  isMainView(): boolean {
    return (
      this.renderInfo.type === 'applet-view' &&
      this.renderInfo.view.type === 'main'
    )
  }
  isAssetView(): boolean {
    return (
      this.renderInfo.type === 'applet-view' &&
      this.renderInfo.view.type === 'asset'
    )
  }
  isOutcomeView(): boolean {
    if (
      this.renderInfo.type !== 'applet-view' ||
      this.renderInfo.view.type !== 'asset'
    ) {
      return false
    }
    return this.renderInfo.view.recordInfo.entryType === 'outcome'
  }
  isProjectView(): boolean {
    if (
      this.renderInfo.type !== 'applet-view' ||
      this.renderInfo.view.type !== 'asset'
    ) {
      return false
    }
    return this.renderInfo.view.recordInfo.entryType === 'project'
  }
  getAppletClient(): AppClient {
    if (this.renderInfo.type !== 'applet-view') {
      throw new Error('Not an applet view')
    }
    return this.renderInfo.appletClient
  }

  getProfilesClient(): ProfilesClient {
    if (this.renderInfo.type !== 'applet-view') {
      throw new Error('Not an applet view')
    }
    return this.renderInfo.profilesClient
  }
  getOutcomeWal(): WAL {
    if (
      this.renderInfo.type !== 'applet-view' ||
      this.renderInfo.view.type !== 'asset' ||
      this.renderInfo.view.recordInfo.entryType !== 'outcome'
    ) {
      throw new Error('Not an outcome view')
    }
    return this.renderInfo.view.wal
  }
  getProjectWal(): WAL {
    if (
      this.renderInfo.type !== 'applet-view' ||
      this.renderInfo.view.type !== 'asset' ||
      this.renderInfo.view.recordInfo.entryType !== 'project'
    ) {
      throw new Error('Not a project view')
    }
    return this.renderInfo.view.wal
  }
}
