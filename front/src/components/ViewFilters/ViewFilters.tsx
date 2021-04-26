import React from 'react'
import { Route } from 'react-router-dom'

function ProjectMapViewOnly({ children }) {
  return <Route path="/project/:projectId/map" render={() => children} />
}
function ProjectPriorityViewOnly({ children }) {
  return <Route path="/project/:projectId/priority" render={() => children} />
}

export { ProjectMapViewOnly, ProjectPriorityViewOnly }
