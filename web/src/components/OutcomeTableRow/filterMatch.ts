import { ComputedOutcome, ComputedScope, ComputedSimpleAchievementStatus } from "../../types"
import { AgentPubKeyB64 } from "../../types/shared"

export type OutcomeTableFilter = {
  keywordOrId?: string
  achievementStatus?: ComputedSimpleAchievementStatus[]
  scope?: ComputedScope[]
  assignees?: AgentPubKeyB64[]
  tags?: string[]
}

export default function filterMatch(outcome: ComputedOutcome, filter: OutcomeTableFilter) {
  let keywordOrIdMatch = true
  let achievementStatusMatch = true
  let scopeMatch = true
  let assigneesMatch = true
  let tagsMatch = true

  if ('keywordOrId' in filter) {
    keywordOrIdMatch =
      !filter.keywordOrId.length ||
      (outcome.content &&
        outcome.content
          .toLowerCase()
          .includes(filter.keywordOrId.toLowerCase()))
  }

  if ('achievementStatus' in filter) {
    achievementStatusMatch = false
    for (const status of filter.achievementStatus) {
      if (outcome.computedAchievementStatus.simple === status) {
        achievementStatusMatch = true
        break
      }
    }
  }

  if ('scope' in filter) {
    scopeMatch = false
    for (const scope of filter.scope) {
      if (outcome.computedScope === scope) {
        scopeMatch = true
        break
      }
    }
  }

  if ('assignees' in filter) {
    assigneesMatch = false
    for (const assignee of filter.assignees) {
      // TODO
      if (outcome.members.includes(assignee)) {
        assigneesMatch = true // assuming assignee filter selection is an OR rather than AND
        break
      }
    }
  }

  if ('tags' in filter) {
    tagsMatch = false
    for (const tag of filter.tags) {
      if (outcome.tags.includes(tag)) {
        tagsMatch = true
        break
      }
    }
  }
  return (
    keywordOrIdMatch &&
    achievementStatusMatch &&
    scopeMatch &&
    assigneesMatch &&
    tagsMatch
  )
}