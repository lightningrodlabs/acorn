import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import '../variables.scss'

import MapViewDevModeComponent, {
  MapViewDevModeProps,
} from '../components/MapViewDevMode/MapViewDevMode'
import { ProjectConnectionsState } from '../redux/persistent/projects/connections/reducer'
import { ProjectOutcomesState } from '../redux/persistent/projects/outcomes/reducer'
import { Connection } from '../types'
import { WithHeaderHash } from '../types/shared'
import {
  testBigAchievedOutcome,
  testBigNotAchievedOutcome,
  testBigPartiallyAchievedOutcome,
  testSmallAchievedOutcome,
  testSmallNotAchievedOutcome,
  testUncertainWithChildrenOutcome,
  testUncertainWithoutChildrenOutcome,
} from './testData/testOutcomes'

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
  ['test-small-not-achieved-header-hash']: testSmallNotAchievedOutcome,
}
const smallAchieved: ProjectOutcomesState = {
  ['test-small-achieved-header-hash']: testSmallAchievedOutcome,
}
const bigNotAchieved: ProjectOutcomesState = {
  ['test-big-not-achieved-header-hash']: testBigNotAchievedOutcome,
}
const bigPartiallyAchieved: ProjectOutcomesState = {
  ['test-big-partially-achieved-header-hash']: testBigPartiallyAchievedOutcome,
}
const bigAchieved: ProjectOutcomesState = {
  ['test-big-achieved-header-hash']: testBigAchievedOutcome,
}
const uncertainWithoutChildren: ProjectOutcomesState = {
  ['test-uncertain-without-children-header-hash']: testUncertainWithoutChildrenOutcome,
}
const uncertainWithChildren: ProjectOutcomesState = {
  ['test-uncertain-with-children-header-hash']: testUncertainWithChildrenOutcome,
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

// More on args: https://storybook.js.org/docs/react/writing-stories/args

export const SmallNotAchieved = Template.bind({})
const args1: MapViewDevModeProps = {
  outcome: testSmallNotAchievedOutcome,
  // outcomes: smallNotAchieved,
  // connections: emptyConnectionsState,
}
SmallNotAchieved.args = args1

export const SmallAchieved = Template.bind({})
const args2: MapViewDevModeProps = {
  outcome: testSmallAchievedOutcome,
  // outcomes: smallAchieved,
  // connections: emptyConnectionsState,
}
SmallAchieved.args = args2

export const BigNotAchieved = Template.bind({})
const args3: MapViewDevModeProps = {
  outcome: testBigNotAchievedOutcome,
  // outcomes: bigNotAchieved,
  // connections: emptyConnectionsState,
}
BigNotAchieved.args = args3

export const BigPartiallyAchieved = Template.bind({})
const args4: MapViewDevModeProps = {
  outcome: testBigPartiallyAchievedOutcome,
  // outcomes: bigPartiallyAchieved,
  // connections: emptyConnectionsState,
}
BigPartiallyAchieved.args = args4

export const BigAchieved = Template.bind({})
const args5: MapViewDevModeProps = {
  outcome: testBigAchievedOutcome,
  // outcomes: bigAchieved,
  // connections: emptyConnectionsState,
}
BigAchieved.args = args5

export const UncertainWithoutChildren = Template.bind({})
const args6: MapViewDevModeProps = {
  outcome: testUncertainWithoutChildrenOutcome,
  // outcomes: uncertainWithoutChildren,
  // connections: emptyConnectionsState,
}
UncertainWithoutChildren.args = args6

export const UncertainWithChildren = Template.bind({})
const args7: MapViewDevModeProps = {
  outcome: testUncertainWithChildrenOutcome,
  // outcomes: uncertainWithChildren,
  // connections: emptyConnectionsState,
}
UncertainWithChildren.args = args7
