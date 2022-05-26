import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import '../variables.scss'

import { EntryPoint, Outcome, OutcomeComment, ProjectMeta } from '../types'
import ExpandedViewMode, {
  ExpandedViewModeProps,
} from '../components/ExpandedViewMode/ExpandedViewMode.component'
import EvDetails from '../components/ExpandedViewMode/EVMiddleColumn/TabContent/EvDetails/EvDetails.component'
import EvComments from '../components/ExpandedViewMode/EVMiddleColumn/TabContent/EvComments/EvComments.component'
import EVRightColumn from '../components/ExpandedViewMode/EVRightColumn/EvRightColumn.component'
import EvTaskList from '../components/ExpandedViewMode/EVMiddleColumn/TabContent/EvTaskList/EvTaskList'
import EvChildren from '../components/ExpandedViewMode/EVMiddleColumn/TabContent/EvChildren/EvChildren'
import testComments from './testData/testComments'
import testProfile from './testData/testProfile'
import {
  testBigAchievedOutcome,
  testBigPartiallyAchievedOutcome,
  testSmallAchievedOutcome,
  testSmallAchievedOutcome2,
  testUncertainWithoutChildrenOutcome,
} from './testData/testOutcomes'
import testTags from './testData/testTags'

// More on args: https://storybook.js.org/docs/react/writing-stories/args

const projectId = '1244323532'

const details = (
  <EvDetails
    projectId={projectId}
    outcome={testSmallAchievedOutcome}
    activeAgentPubKey={'124234134'}
    outcomeHeaderHash={'1344151'}
    projectTags={testTags}
    people={[
      {
        ...testProfile,
        isOutcomeMember: true,
        outcomeMemberHeaderHash: '1241',
      },
    ]}
    profiles={{
      '389457985y498592847': testProfile,
    }}
    assignees={[{ profile: testProfile, outcomeMemberHeaderHash: '124' }]}
    editingPeers={[]}
    updateOutcome={function (
      outcome: Outcome,
      headerHash: string
    ): Promise<void> {
      throw new Error('Function not implemented.')
    }}
    createOutcomeMember={function (headerHash: string): Promise<void> {
      throw new Error('Function not implemented.')
    }}
    deleteOutcomeMember={function (headerHash: string): Promise<void> {
      throw new Error('Function not implemented.')
    }}
    startTitleEdit={function (outcomeHeaderHash: string): void {
      throw new Error('Function not implemented.')
    }}
    endTitleEdit={function (outcomeHeaderHash: string): void {
      throw new Error('Function not implemented.')
    }}
    startDescriptionEdit={function (outcomeHeaderHash: string): void {
      throw new Error('Function not implemented.')
    }}
    endDescriptionEdit={function (outcomeHeaderHash: string): void {
      throw new Error('Function not implemented.')
    }}
    onSaveTag={function (text: string, backgroundColor: string): Promise<void> {
      throw new Error('Function not implemented.')
    }}
  />
)

const comments = (
  <EvComments
    projectId={projectId}
    outcomeContent="New API in typescript definitions are written 
    Acorn no longer uses a legacy unmaintained library and instead it is replaced with a modern typescript API definitions."
    outcomeHeaderHash={''}
    profiles={{
      '389457985y498592847': testProfile,
    }}
    comments={testComments}
    activeAgentPubKey={''}
    createOutcomeComment={function (
      outcomeComment: OutcomeComment
    ): Promise<void> {
      throw new Error('Function not implemented.')
    }}
  />
)

const childrenList = (
  <EvChildren
    outcomeContent="New API in typescript definitions are written 
    Acorn no longer uses a legacy unmaintained library and instead it is replaced with a modern typescript API definitions."
    directChildren={[
      testSmallAchievedOutcome,
      testSmallAchievedOutcome2,
      testBigPartiallyAchievedOutcome,
    ]}
    openExpandedView={() => {}}
  />
)

const taskList = (
  <EvTaskList
    outcomeContent="New API in typescript definitions are written Acorn no longer uses a legacy unmaintained library and instead it is replaced with a modern typescript API definitions."
    tasks={[]}
    onChange={function (
      index: number,
      text: string,
      isChecked: boolean
    ): Promise<void> {
      throw new Error('Function not implemented.')
    }}
    onAdd={function (newText: string): Promise<void> {
      throw new Error('Function not implemented.')
    }}
    onRemove={function (index: number): Promise<void> {
      throw new Error('Function not implemented.')
    }}
  />
)

const rightColumn = (
  <EVRightColumn
    projectId={projectId}
    onClose={() => {}}
    outcome={testSmallAchievedOutcome}
    activeAgentPubKey={''}
    outcomeHeaderHash={''}
    isEntryPoint={false}
    entryPointHeaderHash={''}
    projectMeta={undefined}
    updateOutcome={function (
      outcome: Outcome,
      headerHash: string
    ): Promise<void> {
      throw new Error('Function not implemented.')
    }}
    updateProjectMeta={function (
      projectMeta: ProjectMeta,
      headerHash: string
    ): Promise<void> {
      throw new Error('Function not implemented.')
    }}
    createEntryPoint={function (entryPoint: EntryPoint): Promise<void> {
      throw new Error('Function not implemented.')
    }}
    deleteEntryPoint={function (headerHash: string): Promise<void> {
      throw new Error('Function not implemented.')
    }}
    onDeleteClick={function (outcomeHeaderHash: string): Promise<void> {
      throw new Error('Function not implemented.')
    }}
  />
)

const rightColumnUncertainNoChildren = (
  <EVRightColumn
    projectId={projectId}
    onClose={() => {}}
    outcome={testUncertainWithoutChildrenOutcome}
    activeAgentPubKey={''}
    outcomeHeaderHash={''}
    isEntryPoint={false}
    entryPointHeaderHash={''}
    projectMeta={undefined}
    updateOutcome={function (
      outcome: Outcome,
      headerHash: string
    ): Promise<void> {
      throw new Error('Function not implemented.')
    }}
    updateProjectMeta={function (
      projectMeta: ProjectMeta,
      headerHash: string
    ): Promise<void> {
      throw new Error('Function not implemented.')
    }}
    createEntryPoint={function (entryPoint: EntryPoint): Promise<void> {
      throw new Error('Function not implemented.')
    }}
    deleteEntryPoint={function (headerHash: string): Promise<void> {
      throw new Error('Function not implemented.')
    }}
    onDeleteClick={function (outcomeHeaderHash: string): Promise<void> {
      throw new Error('Function not implemented.')
    }}
  />
)

const rightColumnBig = (
  <EVRightColumn
    projectId={projectId}
    onClose={() => {}}
    outcome={testBigAchievedOutcome}
    activeAgentPubKey={''}
    outcomeHeaderHash={''}
    isEntryPoint={false}
    entryPointHeaderHash={''}
    projectMeta={undefined}
    updateOutcome={function (
      outcome: Outcome,
      headerHash: string
    ): Promise<void> {
      throw new Error('Function not implemented.')
    }}
    updateProjectMeta={function (
      projectMeta: ProjectMeta,
      headerHash: string
    ): Promise<void> {
      throw new Error('Function not implemented.')
    }}
    createEntryPoint={function (entryPoint: EntryPoint): Promise<void> {
      throw new Error('Function not implemented.')
    }}
    deleteEntryPoint={function (headerHash: string): Promise<void> {
      throw new Error('Function not implemented.')
    }}
    onDeleteClick={function (outcomeHeaderHash: string): Promise<void> {
      throw new Error('Function not implemented.')
    }}
  />
)

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Expanded View/ExpandedViewMode',
  component: ExpandedViewMode,
} as ComponentMeta<typeof ExpandedViewMode>

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof ExpandedViewMode> = (args) => {
  return <ExpandedViewMode {...args} />
}

/*
  Uncertain, No Children story
*/

export const UncertainNoChildren = Template.bind({})
const args: ExpandedViewModeProps = {
  projectId: '1234323',
  outcome: testUncertainWithoutChildrenOutcome,
  outcomeHeaderHash: '112412343231',
  commentCount: 3,
  details: details,
  comments: comments,
  childrenList: null,
  taskList: null,
  rightColumn: rightColumnUncertainNoChildren,
  onClose: () => {},
  openExpandedView: () => {},
  outcomeAndAncestors: [],
}
UncertainNoChildren.args = args

/*
  Without Children story
*/

export const SmallNoTasks = Template.bind({})
const smallNoTasksArgs: ExpandedViewModeProps = {
  projectId: '1234323',
  outcome: testSmallAchievedOutcome,
  outcomeHeaderHash: '112412343',
  commentCount: 3,
  details: details,
  comments: comments,
  childrenList: null,
  taskList: taskList,
  rightColumn: rightColumn,
  onClose: () => {},
  openExpandedView: () => {},
  outcomeAndAncestors: [],
}
SmallNoTasks.args = smallNoTasksArgs

/*
  With Children story (Big, Achieved)
*/

export const Big = Template.bind({})
const withChildrenArgs: ExpandedViewModeProps = {
  projectId: '1234323',
  outcome: testBigAchievedOutcome,
  outcomeHeaderHash: '112412343',
  commentCount: 3,
  details: details,
  comments: comments,
  childrenList: childrenList,
  taskList: null,
  rightColumn: rightColumnBig,
  onClose: () => {},
  openExpandedView: () => {},
  outcomeAndAncestors: [],
}
Big.args = withChildrenArgs
