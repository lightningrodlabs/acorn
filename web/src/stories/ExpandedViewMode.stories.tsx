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
import { testBigOutcome, testSmallOutcome } from './testData/testOutcomes'

// More on args: https://storybook.js.org/docs/react/writing-stories/args

const projectId = '1244323532'

const details = (
  <EvDetails
    projectId={projectId}
    outcome={testSmallOutcome}
    activeAgentPubKey={'124234134'}
    outcomeHeaderHash={'1344151'}
    projectTags={[]}
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
    outcomeContent="This is the content property of an Outcome, it can get long sometimes"
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
    outcomeContent="This is the content property of an Outcome, it can get long sometimes"
    directChildren={[testSmallOutcome]}
  />
)

const taskList = (
  <EvTaskList
    outcomeContent="This is the content property of an Outcome, it can get long sometimes"
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
    outcome={testSmallOutcome}
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
  Without Children story
*/

export const WithoutChildren = Template.bind({})
const args: ExpandedViewModeProps = {
  projectId: '1234323',
  outcome: testSmallOutcome,
  outcomeHeaderHash: '112412343',
  commentCount: 3,
  details: details,
  comments: comments,
  childrenList: null,
  taskList: taskList,
  rightColumn: rightColumn,
  onClose: () => {},
}
WithoutChildren.args = args

/*
  With Children story
*/

export const WithChildren = Template.bind({})
const withChildrenArgs: ExpandedViewModeProps = {
  projectId: '1234323',
  outcome: testBigOutcome,
  outcomeHeaderHash: '112412343',
  commentCount: 3,
  details: details,
  comments: comments,
  childrenList: childrenList,
  taskList: null,
  rightColumn: rightColumn,
  onClose: () => {},
}
WithChildren.args = withChildrenArgs
