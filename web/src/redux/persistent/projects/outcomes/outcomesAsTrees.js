export default function outcomesAsTrees(
  data,
  { withMembers = false, withComments = false, withVotes = false } = {}
) {
  const { outcomes, connections, outcomeMembers, outcomeVotes, outcomeComments, agents } = data

  // modify so that all outcomes have their related things, if in opts
  let allOutcomes = outcomes
  if (withComments || withMembers || withVotes) {
    const allOutcomesArray = Object.values(outcomes).map(outcome => {
      let extensions = {}
      if (withMembers) {
        extensions.members = Object.values(outcomeMembers)
          .filter(gm => gm.outcomeHeaderHash === outcome.headerHash)
          .map(gm => agents[gm.agentAddress])
      }
      if (withComments) {
        extensions.comments = Object.values(outcomeComments).filter(
          gc => gc.outcomeHeaderHash === outcome.headerHash
        )
      }
      if (withVotes) {
        extensions.votes = Object.values(outcomeVotes).filter(
          gv => gv.outcomeHeaderHash === outcome.headerHash
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
  const allOutcomeAddresses = Object.values(outcomes).map(outcome => outcome.headerHash)
  // find the Outcome objects without parent Outcomes
  // since they will sit at the top level
  const noParentsAddresses = allOutcomeAddresses.filter(outcomeHeaderHash => {
    return !connectionsAsArray.find(connection => connection.childHeaderHash === outcomeHeaderHash)
  })
  // recursively calls itself
  // so that it constructs the full sub-tree for each root Outcome
  function getOutcome(outcomeHeaderHash) {
    return {
      ...allOutcomes[outcomeHeaderHash],
      children: connectionsAsArray
        // find the connections indicating the children of this outcome
        .filter(connection => connection.parentHeaderHash === outcomeHeaderHash)
        // actually nest the children Outcomes, recurse
        .map(connection => getOutcome(connection.childHeaderHash)),
    }
  }
  // start with the root Outcomes, and recurse down to their children
  return noParentsAddresses.map(getOutcome)
}
