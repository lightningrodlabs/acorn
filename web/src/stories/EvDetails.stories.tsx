import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import '../variables.scss'

import EvDetails, {
  EvDetailsProps,
} from '../components/ExpandedViewMode/EVMiddleColumn/TabContent/EvDetails/EvDetails.component'
import {
  ComputedOutcome,
  ComputedScope,
  ComputedSimpleAchievementStatus,
  Profile,
} from '../types'

// More on args: https://storybook.js.org/docs/react/writing-stories/args

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Expanded View/EvDetails',
  component: EvDetails,
} as ComponentMeta<typeof EvDetails>

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof EvDetails> = (args) => {
  return <EvDetails {...args} />
}

export const Primary = Template.bind({})
Primary.storyName = 'EvDetails'

const outcome: ComputedOutcome = {
  headerHash: '12344',
  content: 'test content',
  creatorAgentPubKey: 'creatoragentpubkey',
  editorAgentPubKey: 'editoryagentpubkey',
  timestampCreated: Date.now(),
  timestampUpdated: Date.now(),
  tags: [],
  description: 'test description',
  timeFrame: null, // { fromDate: Date.now(), toDate: Date.now() },
  isImported: false,
  scope: { Uncertain: 0 }, // ignored
  computedScope: ComputedScope.Uncertain,
  computedAchievementStatus: {
    uncertains: 2,
    smallsAchieved: 0,
    smallsTotal: 0,
    simple: ComputedSimpleAchievementStatus.NotAchieved,
  },
  // @ts-ignore
  children: [{}, {}],
}

const pegah: Profile = {
  firstName: 'Pegah',
  lastName: 'Vaezi',
  handle: '389457985y498592847',
  status: 'Online',
  avatarUrl:
    'https://i.pinimg.com/550x/c0/3d/3f/c03d3f965a8091206f4a0e742bb97c9f.jpg',
  agentPubKey: '389457985y498592847',
  isImported: false,
}

const props: EvDetailsProps = {
  projectId: '1241241',
  outcomeHeaderHash: '1243523',
  activeAgentPubKey: '1245314',
  outcome: outcome,
  people: [
    {
      ...pegah,
      isOutcomeMember: true,
      outcomeMemberHeaderHash: '1241',
    },
  ],
  profiles: {
    '389457985y498592847': pegah,
  },
  assignees: [{ profile: pegah, outcomeMemberHeaderHash: '124' }],
  editingPeers: [],
  updateOutcome: async () => {},
  createOutcomeMember: async () => {},
  deleteOutcomeMember: async () => {},
  startTitleEdit: () => {},
  endTitleEdit: () => {},
  startDescriptionEdit: () => {},
  endDescriptionEdit: () => {},
}
Primary.args = props
