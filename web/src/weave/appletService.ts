import { AppClient, encodeHashToBase64 } from '@holochain/client'
import { AppletServices, AssetInfo, RecordInfo, WAL } from '@theweave/api'
import { getProjectCellIdStrings } from '../projectAppIds'
import ProjectsZomeApi from '../api/projectsApi'
import { cellIdFromString } from '../utils'
import { WireRecord } from '../api/hdkCrud'
import { Outcome } from 'zod-models'
import { ProjectMeta } from '../types'
import { WalWrallper } from '../domain/wal'
import { CellIdWrapper } from '../domain/cellId'

const appletServices: AppletServices = {
  creatables: {
    board: {
      label: 'Project',
      icon_src: 'hierarchy.svg',
    },
  },
  // Types of UI widgets/blocks that this Applet supports
  blockTypes: {
    projects: {
      label: 'projects',
      icon_src: `<svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M0 96C0 60.7 28.7 32 64 32H448c35.3 0 64 28.7 64 64V416c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V96zm64 0v64h64V96H64zm384 0H192v64H448V96zM64 224v64h64V224H64zm384 0H192v64H448V224zM64 352v64h64V352H64zm384 0H192v64H448V352z"/></svg>`,
      view: 'applet-view',
    },
  },
  getAssetInfo: async (
    appletClient: AppClient,
    wal: WAL,
    recordInfo: RecordInfo
  ): Promise<AssetInfo | undefined> => {
    if (!recordInfo) {
      throw new Error('Null WAL not supported, must supply a recordInfo')
    }
    const walWrapper = WalWrallper.fromWal(wal)
    const projectCellIds = await getProjectCellIdStrings()
    const projectsZomeApi = new ProjectsZomeApi(appletClient)
    const projectMetas: [
      CellIdWrapper,
      WireRecord<ProjectMeta>
    ][] = await Promise.all(
      projectCellIds.map(async (cellId) => {
        const cellIdWrapper = CellIdWrapper.fromCellIdString(cellId)
        return [
          cellIdWrapper,
          await projectsZomeApi.projectMeta.fetchProjectMeta(
            cellIdWrapper.getCellId()
          ),
        ]
      })
    )
    if (!walWrapper.hasContext()) {
      const matchingProjectMeta = projectMetas.find(
        ([_, projectMeta]) =>
          projectMeta.entryHash === walWrapper.getHrlRecordHashB64()
      )
      if (!matchingProjectMeta) {
        throw new Error('No matching project meta found')
      }
      return {
        icon_src: 'hierarchy.svg',
        name: matchingProjectMeta[1].entry.name,
      }
    }

    const allOutcomes: [
      CellIdWrapper,
      WireRecord<Outcome>[]
    ][] = await Promise.all(
      projectCellIds.map(async (cellId) => {
        const cellIdWrapper = CellIdWrapper.fromCellIdString(cellId)
        const outcomes = await projectsZomeApi.outcome.fetch(
          cellIdWrapper.getCellId(),
          {
            All: null,
          }
        )
        return [cellIdWrapper, outcomes]
      })
    )
    for (const [cellIdWrapper, outcomes] of allOutcomes) {
      const outcome = outcomes.find(
        (outcome) => outcome.entryHash === encodeHashToBase64(wal.hrl[1])
      )
      if (outcome) {
        const projectMeta = projectMetas.find(
          ([projectCellId, _]) =>
            projectCellId.getCellIdString() === cellIdWrapper.getCellIdString()
        )
        if (!projectMeta) {
          throw new Error('No matching project meta found')
        }
        return {
          icon_src: 'outcome.svg',
          name: `${projectMeta[1].entry.name} - ${outcome.entry.content}`,
        }
      }
    }
  },
}
