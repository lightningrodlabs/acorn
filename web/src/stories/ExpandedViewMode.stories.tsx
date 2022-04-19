import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import '../variables.scss'

import {
  ComputedOutcome,
  ComputedScope,
  ComputedSimpleAchievementStatus,
  EntryPoint,
  Outcome,
  OutcomeComment,
  ProjectMeta,
} from '../types'
import ExpandedViewMode, {
  ExpandedViewModeProps,
} from '../components/ExpandedViewMode/ExpandedViewMode.component'
import EvDetails from '../components/ExpandedViewMode/EVMiddleColumn/TabContent/EvDetails/EvDetails.component'
import Comments from '../components/ExpandedViewMode/EVMiddleColumn/TabContent/Comments/Comments.component'
import EVRightColumn from '../components/ExpandedViewMode/EVRightColumn/EvRightColumn.component'

// More on args: https://storybook.js.org/docs/react/writing-stories/args

const creator = {
  firstName: 'Pegah',
  lastName: 'Vaezi',
  handle: '389457985y498592847',
  status: 'Online',
  avatarUrl:
    'https://i.pinimg.com/550x/c0/3d/3f/c03d3f965a8091206f4a0e742bb97c9f.jpg',
  agentPubKey: '389457985y498592847',
  isImported: false,
}
const comment = {
  outcomeHeaderHash: '389457985y498592847',
  content:
    'can anyone here help me with several google analytics account setups? I need some training and have clients using square and wordpress. I used to just rely on monster insights plug-in but with GA4 I think things have changed. HALP!',
  creatorAgentPubKey: '389457985y498592847',
  unixTimestamp: Date.now(), //f64,
  isImported: false,
}

const outcome: ComputedOutcome = {
  headerHash: '12344',
  content: 'test content',
  creatorAgentPubKey: 'creatoragentpubkey',
  editorAgentPubKey: 'editoryagentpubkey',
  timestampCreated: Date.now(),
  timestampUpdated: Date.now(),
  scope: { Small: 'Achieved' },
  tags: [],
  description: 'test description',
  timeFrame: null, // { fromDate: Date.now(), toDate: Date.now() },
  isImported: false,
  computedScope: ComputedScope.Small,
  computedAchievementStatus: {
    uncertains: 0,
    smallsAchieved: 0,
    smallsTotal: 0,
    simple: ComputedSimpleAchievementStatus.NotAchieved,
  },
  children: [],
}

const projectId = '1244323532'

const details = () => (
  <EvDetails
    projectId={projectId}
    outcome={outcome}
    activeAgentPubKey={'124234134'}
    outcomeHeaderHash={'1344151'}
    assignees={[]}
    editingPeers={[]}
    profiles={{}}
    updateOutcome={function (
      outcome: Outcome,
      headerHash: string
    ): Promise<void> {
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
  />
)

const comments = () => (
  <Comments
    projectId={projectId}
    outcomeHeaderHash={''}
    profiles={{}}
    comments={[]}
    activeAgentPubKey={''}
    createOutcomeComment={function (
      outcomeComment: OutcomeComment
    ): Promise<void> {
      throw new Error('Function not implemented.')
    }}
  />
)

const rightColumn = () => (
  <EVRightColumn
    projectId={projectId}
    onClose={() => {}}
    outcome={outcome}
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
  title: 'Example/ExpandedViewMode',
  component: ExpandedViewMode,
} as ComponentMeta<typeof ExpandedViewMode>

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof ExpandedViewMode> = (args) => {
  return <ExpandedViewMode {...args} />
}

export const Primary = Template.bind({})

const args: ExpandedViewModeProps = {
  projectId: '1234323',
  outcome,
  outcomeHeaderHash: '112412343',
  commentCount: 3,
  details: details(),
  comments: comments(),
  rightColumn: rightColumn(),
  onClose: () => {},
}

// Primary.args = args
Primary.args = args
