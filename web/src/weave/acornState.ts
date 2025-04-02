import { AppClient, EntryHashB64 } from '@holochain/client'
import { CellIdWrapper } from '../domain/cellId'
import { Outcome, ProjectMeta } from '../types'
import { getProjectCellIdStrings } from '../projectAppIds'
import ProjectsZomeApi from '../api/projectsApi'
import { WireRecord } from '../api/hdkCrud'

export class AcornState {
  private projectCellIds: CellIdWrapper[]
  private projectMetas: Map<string, WireRecord<ProjectMeta>>
  private outcomes: Map<string, WireRecord<Outcome>[]>

  private constructor(
    projectCellIds: CellIdWrapper[],
    projectMetas: Map<string, WireRecord<ProjectMeta>>,
    outcomes: Map<string, WireRecord<Outcome>[]>
  ) {
    this.projectCellIds = projectCellIds
    this.projectMetas = projectMetas
    this.outcomes = outcomes
  }

  static async fromAppClient(appClient: AppClient) {
    const projectCellIds = await getProjectCellIdStrings()
    const projectCellIdWrappers = projectCellIds.map((cellId) =>
      CellIdWrapper.fromCellIdString(cellId)
    )
    const projectsZomeApi = new ProjectsZomeApi(appClient)
    const projectMetasTuple: [
      CellIdWrapper,
      WireRecord<ProjectMeta>
    ][] = await Promise.all(
      projectCellIdWrappers.map(async (cellIdWrapper) => {
        return [
          cellIdWrapper,
          await projectsZomeApi.projectMeta.fetchProjectMeta(
            cellIdWrapper.getCellId()
          ),
        ]
      })
    )
    const projectMetas = new Map<string, WireRecord<ProjectMeta>>()
    for (const [cellIdWrapper, projectMeta] of projectMetasTuple) {
      projectMetas.set(cellIdWrapper.getCellIdString(), projectMeta)
    }
    const allOutcomesTuple: [
      CellIdWrapper,
      WireRecord<Outcome>[]
    ][] = await Promise.all(
      projectCellIdWrappers.map(async (cellIdWrapper) => {
        const outcomes = await projectsZomeApi.outcome.fetch(
          cellIdWrapper.getCellId(),
          {
            All: null,
          }
        )
        return [cellIdWrapper, outcomes]
      })
    )
    const outcomes = new Map<string, WireRecord<Outcome>[]>()
    for (const [cellIdWrapper, outcome] of allOutcomesTuple) {
      outcomes.set(cellIdWrapper.getCellIdString(), outcome)
    }

    return new AcornState(projectCellIdWrappers, projectMetas, outcomes)
  }

  findProjectMetaByEntryHashB64(entryHashB64: EntryHashB64) {
    for (const projectMeta of this.projectMetas.values()) {
      if (projectMeta.entryHash === entryHashB64) {
        return projectMeta
      }
    }
    return null
  }
  getProjectMetaByCellIdString(cellIdString: string) {
    const projectMeta = this.projectMetas.get(cellIdString)
    if (projectMeta) {
      return projectMeta
    }
    return null
  }
  findOutcomeByEntryHashB64(
    entryHashB64: EntryHashB64
  ): { cellIdWrapper: CellIdWrapper; outcome: WireRecord<Outcome> } | null {
    for (const [cellIdString, outcomes] of this.outcomes) {
      const outcome = outcomes.find(
        (outcome) => outcome.entryHash === entryHashB64
      )
      if (outcome) {
        return {
          cellIdWrapper: CellIdWrapper.fromCellIdString(cellIdString),
          outcome,
        }
      }
    }
    return null
  }
  searchProjectMetasByText(
    searchFilter: string
  ): {
    cellIdString: string
    projectMeta: WireRecord<ProjectMeta>
  }[] {
    const matchingProjectMetas: {
      cellIdString: string
      projectMeta: WireRecord<ProjectMeta>
    }[] = []
    for (const [cellIdString, projectMeta] of this.projectMetas) {
      if (
        projectMeta.entry.name
          .toLowerCase()
          .includes(searchFilter.toLowerCase())
      ) {
        matchingProjectMetas.push({ cellIdString, projectMeta })
      }
    }
    return matchingProjectMetas
  }
  searchOutcomesByText(
    searchFilter: string
  ): {
    cellIdString: string
    outcome: WireRecord<Outcome>
  }[] {
    const matchingOutcomes: {
      cellIdString: string
      outcome: WireRecord<Outcome>
    }[] = []
    for (const [cellIdString, outcomes] of this.outcomes) {
      for (const outcome of outcomes) {
        if (
          outcome.entry.content
            .toLowerCase()
            .includes(searchFilter.toLowerCase())
        ) {
          matchingOutcomes.push({ cellIdString, outcome })
        }
      }
    }
    return matchingOutcomes
  }
}
