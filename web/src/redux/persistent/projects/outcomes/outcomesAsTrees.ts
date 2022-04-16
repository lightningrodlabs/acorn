import _ from 'lodash'
import { ProjectComputedOutcomes } from '../../../../context/ComputedOutcomeContext'
import {
  ComputedOutcome,
  ComputedScope,
  ComputedSimpleAchievementStatus,
  Connection,
  OptionalOutcomeData,
  Outcome,
  OutcomeComment,
  OutcomeMember,
  OutcomeVote,
} from '../../../../types'
import { HeaderHashB64, WithHeaderHash } from '../../../../types/shared'
import { RootState } from '../../../reducer'
import { computeAchievementStatus, computeScope } from './computedState'

export type TreeData = {
  agents: RootState['agents']
  outcomes: {
    [headerHash: HeaderHashB64]: WithHeaderHash<Outcome>
  }
  connections: {
    [headerHash: HeaderHashB64]: WithHeaderHash<Connection>
  }
  outcomeMembers: {
    [headerHash: HeaderHashB64]: WithHeaderHash<OutcomeMember>
  }
  outcomeVotes: {
    [headerHash: HeaderHashB64]: WithHeaderHash<OutcomeVote>
  }
  outcomeComments: {
    [headerHash: HeaderHashB64]: WithHeaderHash<OutcomeComment>
  }
}

export default function outcomesAsTrees(
  treeData: TreeData,
  { withMembers = false, withComments = false, withVotes = false } = {}
): ProjectComputedOutcomes {
  const {
    outcomes,
    connections,
    outcomeMembers,
    outcomeVotes,
    outcomeComments,
    agents,
  } = treeData

  // modify so that all outcomes have their related things, if in opts
  let allOutcomes = outcomes
  if (withComments || withMembers || withVotes) {
    const allOutcomesArray = Object.values(outcomes).map((outcome) => {
      let extensions: OptionalOutcomeData = {}
      if (withMembers) {
        extensions.members = Object.values(outcomeMembers)
          .filter((om) => om.outcomeHeaderHash === outcome.headerHash)
          .map((om) => agents[om.memberAgentPubKey])
      }
      if (withComments) {
        extensions.comments = Object.values(outcomeComments).filter(
          (oc) => oc.outcomeHeaderHash === outcome.headerHash
        )
      }
      if (withVotes) {
        extensions.votes = Object.values(outcomeVotes).filter(
          (ov) => ov.outcomeHeaderHash === outcome.headerHash
        )
      }
      return {
        ...outcome,
        ...extensions,
      }
    })
    allOutcomes = _.keyBy(allOutcomesArray, 'headerHash')
  }

  // CONSTRUCT TREES FOR THE INDENTED NAV TREE VIEW
  const connectionsAsArray = Object.values(connections)
  const allOutcomeAddresses = Object.values(outcomes).map(
    (outcome) => outcome.headerHash
  )
  // find the Outcome objects without parent Outcomes
  // since they will sit at the top level
  const noParentsAddresses = allOutcomeAddresses.filter((outcomeHeaderHash) => {
    return !connectionsAsArray.find(
      (connection) => connection.childHeaderHash === outcomeHeaderHash
    )
  })

  const computedOutcomesKeyed: ProjectComputedOutcomes['computedOutcomesKeyed'] = {}
  // recursively calls itself
  // so that it constructs the full sub-tree for each root Outcome
  function getOutcome(outcomeHeaderHash: HeaderHashB64): ComputedOutcome {
    const self = allOutcomes[outcomeHeaderHash]
    const children = connectionsAsArray
      // find the connections indicating the children of this outcome
      .filter((connection) => connection.parentHeaderHash === outcomeHeaderHash)
      // actually nest the children Outcomes, recurse
      .map((connection) => getOutcome(connection.childHeaderHash))

    const computedOutcome = {
      ...self,
      computedAchievementStatus: computeAchievementStatus(self, children),
      computedScope: computeScope(self, children),
      children,
    }
    // add it to our 'tracking' object as well
    // which will be used for quicker access to specific
    // outcomes
    computedOutcomesKeyed[self.headerHash] = computedOutcome
    return computedOutcome
  }
  // start with the root Outcomes, and recurse down to their children
  const computedOutcomesAsTree = noParentsAddresses.map(getOutcome)

  return {
    computedOutcomesAsTree,
    computedOutcomesKeyed
  }
}
