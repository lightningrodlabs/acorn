import _ from 'lodash'
import { ProjectComputedOutcomes } from '../../../../context/ComputedOutcomeContext'
import { ComputedOutcome, Connection, OptionalOutcomeData } from '../../../../types'
import { ActionHashB64, WithActionHash } from '../../../../types/shared'
import { AgentsState } from '../../profiles/agents/reducer'
import { ProjectConnectionsState } from '../connections/reducer'
import { ProjectOutcomeCommentsState } from '../outcome-comments/reducer'
import { ProjectOutcomeMembersState } from '../outcome-members/reducer'
import { computeAchievementStatus, computeScope } from './computedState'
import { ProjectOutcomesState } from './reducer'

export type GraphData = {
  outcomes: ProjectOutcomesState
  connections: ProjectConnectionsState
  agents?: AgentsState
  outcomeMembers?: ProjectOutcomeMembersState
  outcomeComments?: ProjectOutcomeCommentsState
}

export type Graph = {
  outcomes: ProjectComputedOutcomes
  connections: ProjectConnectionsState
}
export default function outcomesAsGraph(
  graphData: GraphData,
  { withMembers = false, withComments = false } = {}
): Graph {
  const {
    outcomes,
    connections,
    outcomeMembers,
    outcomeComments,
    agents,
  } = graphData

  // modify so that all outcomes have their related things, if in opts
  let allOutcomes = outcomes
  if (withComments || withMembers) {
    const allOutcomesArray = Object.values(outcomes).map((outcome) => {
      let extensions: OptionalOutcomeData = {}
      if (withMembers) {
        extensions.members = Object.values(outcomeMembers)
          .filter((om) => om.outcomeActionHash === outcome.actionHash)
          .map((om) => agents[om.memberAgentPubKey])
      }
      if (withComments) {
        extensions.comments = Object.values(outcomeComments).filter(
          (oc) => oc.outcomeActionHash === outcome.actionHash
        )
      }
      return {
        ...outcome,
        ...extensions,
      }
    })
    allOutcomes = _.keyBy(allOutcomesArray, 'actionHash')
  }

  // CONSTRUCT TREES FOR THE INDENTED NAV TREE VIEW
  const connectionsAsArray = Object.values(connections)
  const allOutcomeAddresses = Object.values(outcomes).map(
    (outcome) => outcome.actionHash
  )
  // find the Outcome objects without parent Outcomes
  // since they will sit at the top level
  const noParentsAddresses = allOutcomeAddresses.filter((outcomeActionHash) => {
    return !connectionsAsArray.find(
      (connection) => connection.childActionHash === outcomeActionHash
    )
  })

  const computedOutcomesKeyed: ProjectComputedOutcomes['computedOutcomesKeyed'] = {}
  // recursively calls itself
  // so that it constructs the full sub-tree for each root Outcome
  function getOutcome(outcomeActionHash: ActionHashB64, connection?: WithActionHash<Connection>): ComputedOutcome {
    const self = allOutcomes[outcomeActionHash]
    if (!self) {
      // defensive coding, during loading
      return undefined
    }
    const children = connectionsAsArray
      // find the connections indicating the children of this outcome
      .filter((connection) => connection.parentActionHash === outcomeActionHash)
      // actually nest the children Outcomes, recurse
      .map((connection) => getOutcome(connection.childActionHash, connection))
      .filter((maybeOutcome) => !!maybeOutcome)

    const computedOutcome = {
      ...self,
      connection,
      computedAchievementStatus: computeAchievementStatus(self, children),
      computedScope: computeScope(self, children),
      children,
    }
    // add it to our 'tracking' object as well
    // which will be used for quicker access to specific
    // outcomes
    computedOutcomesKeyed[self.actionHash] = computedOutcome
    return computedOutcome
  }
  // start with the root Outcomes, and recurse down to their children
  const computedOutcomesAsTree = noParentsAddresses.map(actionHash => getOutcome(actionHash))

  return {
    outcomes: {
      computedOutcomesAsTree,
      computedOutcomesKeyed,
    },
    connections,
  }
}
