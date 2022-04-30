import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import '../variables.scss'

import MapViewDevModeComponent, {
  MapViewDevModeProps,
} from '../components/MapViewDevMode/MapViewDevMode'
import { ProjectConnectionsState } from '../redux/persistent/projects/connections/reducer'
import { ProjectOutcomesState } from '../redux/persistent/projects/outcomes/reducer'
import { Outcome, Connection } from '../types'
import { WithHeaderHash } from '../types/shared'
import { testSmallAchievedOutcome, testSmallNotAchievedOutcome } from './testData/testOutcomes'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Map View/MapViewDevMode',
  component: MapViewDevModeComponent,
} as ComponentMeta<typeof MapViewDevModeComponent>

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof MapViewDevModeComponent> = (args) => {
  return <MapViewDevModeComponent {...args} />
}

/*
  Data
*/

const connection1: WithHeaderHash<Connection> = {
  parentHeaderHash: '412',
  childHeaderHash: '413',
  randomizer: 1241,
  isImported: false,
  headerHash: '4124131',
}

const smallNotAchieved: ProjectOutcomesState = {
  ['12344']: testSmallNotAchievedOutcome,
}

const smallAchieved: ProjectOutcomesState = {
  ['12345']: testSmallAchievedOutcome,
}

const emptyConnectionsState: ProjectConnectionsState = {}

// const outcomesState: ProjectOutcomesState = {
//   ['412']: outcome1,
//   ['413']: outcome2,
//   ['414']: outcome3,
// }
// const connectionsState: ProjectConnectionsState = {
//   ['123']: connection1,
// }

/* End Data */

export const SmallNotAchieved = Template.bind({})
// More on args: https://storybook.js.org/docs/react/writing-stories/args
const args1: MapViewDevModeProps = {
  outcomes: smallNotAchieved,
  connections: emptyConnectionsState,
}
SmallNotAchieved.args = args1

export const SmallAchieved = Template.bind({})
// More on args: https://storybook.js.org/docs/react/writing-stories/args
const args2: MapViewDevModeProps = {
  outcomes: smallAchieved,
  connections: emptyConnectionsState,
}
SmallAchieved.args = args2
