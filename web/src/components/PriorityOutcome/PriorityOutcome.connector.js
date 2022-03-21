import { connect } from 'react-redux'
import PriorityOutcome from './PriorityOutcome.component'

function mapStateToProps(state, ownProps) {
  const { projectId, outcome } = ownProps
  // filters all the OutcomeVotes down to a list
  // of only the Votes on the selected Outcome
  const outcomeVotes = state.projects.outcomeVotes[projectId] || {}
  const allVotesArray = Object.values(outcomeVotes)
  const votes = allVotesArray.filter(function (outcomeVote) {
    return outcomeVote.outcomeAddress === outcome.headerHash
  })
  return {
    // name of the key 'whoami' MUST match the prop name
    // expected on the component
    whoami: state.whoami,
    votes,
  }
}

function mapDispatchToProps(dispatch, ownProps) {
  // const { projectId } = ownProps
  return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(PriorityOutcome)
