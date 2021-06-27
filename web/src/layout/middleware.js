import {
    createGoalWithEdge,
    fetchGoals,
    archiveGoalFully
} from '../projects/goals/actions'
import {
    createEdge,
    fetchEdges,
    archiveEdge,
} from '../projects/edges/actions'
import {
    updateLayout
} from '../layout/actions'
import layoutFormula from '../drawing/layoutFormula'

const isOneOfLayoutAffectingActions = (action) => {
    const { type } = action
    return type === createGoalWithEdge.success().type
        || type === fetchGoals.success().type
        || type === archiveGoalFully.success().type
        || type === createEdge.success().type
        || type === fetchEdges.success().type
        || type === archiveEdge.success().type
}

// watch for actions that will affect the layout (create/fetches/deletes)
// and update the layout when we see an action like that
// it is useful to have this layout cached in the state for performance reasons
const layoutWatcher = store => next => action => {
    let result = next(action)
    if (isOneOfLayoutAffectingActions(action)) {
        const nextState = store.getState()
        const projectId = nextState.ui.activeProject
        const data = {
            goals: nextState.projects.goals[projectId] || {},
            edges: nextState.projects.edges[projectId] || {},
        }
        const newLayout = layoutFormula(data)
        store.dispatch(updateLayout(newLayout))
    }

    return result
}

export {
    layoutWatcher
}