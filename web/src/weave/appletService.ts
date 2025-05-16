import { AppClient, decodeHashFromBase64 } from '@holochain/client'
import { AppletServices, AssetInfo, RecordInfo, WAL } from '@theweave/api'

import { WireRecord } from '../api/hdkCrud'
import { Outcome } from 'zod-models'
import { WalWrapper } from '../domain/wal'
import { CellIdWrapper } from '../domain/cellId'
import { AcornState } from './acornState'
import { ProjectMeta } from '../types'

const BOARD_ICON_SRC = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30"><g id="hierarchy" transform="translate(-2.5 -2.348)"><rect id="Rectangle_102" data-name="Rectangle 102" width="10" height="7" transform="translate(12 3.848)" fill="none" stroke="%23000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"/><rect id="Rectangle_103" data-name="Rectangle 103" width="10" height="7" transform="translate(21 23.848)" fill="none" stroke="%23000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"/><rect id="Rectangle_104" data-name="Rectangle 104" width="10" height="7" transform="translate(4 23.848)" fill="none" stroke="%23000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"/><path id="Path_178" data-name="Path 178" d="M7,18.712V12H23.78v6.712" transform="translate(2.034 5.424)" fill="none" stroke="%23000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"/><path id="Path_179" data-name="Path 179" d="M12,14.712V8" transform="translate(5.424 2.712)" fill="none" stroke="%23000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"/></g></svg>`
const CARD_ICON_SRC = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" class="devfont devfont-profile"><path d="M21 4H3v16h18V4z"></path><path d="M11 8H7v4h4V8z"></path><path d="M15 8h2"></path><path d="M15 12h2"></path><path d="M7 16h10"></path></svg>`

export const appletServices: AppletServices = {
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
    const walWrapper = WalWrapper.fromWal(wal)
    const acornState = await AcornState.fromAppClient(appletClient)

    /** assume that no context means it is a project reference */
    if (!walWrapper.hasContext()) {
      const matchingProjectMeta = acornState.findProjectMetaByActionHashB64(
        walWrapper.getHrlRecordHashB64()
      )
      if (!matchingProjectMeta) {
        throw new Error('No matching project meta found')
      }
      return {
        icon_src: BOARD_ICON_SRC,
        name: matchingProjectMeta.entry.name,
      }
    }

    const matchingOutcome = acornState.findOutcomeByActionHashB64(
      walWrapper.getHrlRecordHashB64()
    )
    if (!matchingOutcome) {
      throw new Error('No matching outcome found')
    }
    const projectMeta = acornState.getProjectMetaByCellIdString(
      matchingOutcome.cellIdWrapper.getCellIdString()
    )
    if (!projectMeta) {
      throw new Error('No matching project meta found')
    }
    return {
      icon_src: CARD_ICON_SRC,
      name: `${projectMeta.entry.name}: ${matchingOutcome.outcome.entry.content}`,
    }
  },

  search: async (
    appletClient,
    appletHash,
    weaveServices,
    searchFilter
  ): Promise<Array<WAL>> => {
    const acornState = await AcornState.fromAppClient(appletClient)
    const matchingProjectMetas: {
      cellIdString: string
      projectMeta: WireRecord<ProjectMeta>
    }[] = acornState.searchProjectMetasByText(searchFilter)
    const matchingOutcomes: {
      cellIdString: string
      outcome: WireRecord<Outcome>
    }[] = acornState.searchOutcomesByText(searchFilter)

    const matchingWals: WAL[] = []
    for (const { cellIdString, projectMeta } of matchingProjectMetas) {
      const cellIdWrapper = CellIdWrapper.fromCellIdString(cellIdString)
      const hrl: WAL = {
        hrl: [
          cellIdWrapper.getDnaHash(),
          decodeHashFromBase64(projectMeta.actionHash),
        ],
      }
      matchingWals.push(hrl)
    }
    for (const { cellIdString, outcome } of matchingOutcomes) {
      const cellIdWrapper = CellIdWrapper.fromCellIdString(cellIdString)
      const hrl: WAL = {
        hrl: [
          cellIdWrapper.getDnaHash(),
          decodeHashFromBase64(outcome.actionHash),
        ],
        context: 'outcome',
      }
      matchingWals.push(hrl)
    }
    return Array.from(matchingWals)
  },
}
