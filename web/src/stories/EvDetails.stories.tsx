import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import '../variables.scss'

import EvDetails, {
  EvDetailsProps,
} from '../components/ExpandedViewMode/EVMiddleColumn/TabContent/EvDetails/EvDetails.component'
import testProfile from './testData/testProfile'
import { testBigAchievedOutcome } from './testData/testOutcomes'

// More on args: https://storybook.js.org/docs/react/writing-stories/args

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Expanded View/Tabs/EvDetails',
  component: EvDetails,
} as ComponentMeta<typeof EvDetails>

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof EvDetails> = (args) => {
  return <EvDetails {...args} />
}

export const Primary = Template.bind({})
Primary.storyName = 'EvDetails'

const props: EvDetailsProps = {
  projectId: '1241241',
  outcomeActionHash: '1243523',
  activeAgentPubKey: '1245314',
  outcome: testBigAchievedOutcome,
  projectTags: [],
  people: [
    {
      ...testProfile,
      isOutcomeMember: true,
      outcomeMemberActionHash: '1241',
    },
  ],
  description: "description",
  content: "content",
  githubInputLinkText: "https://github.com/lightningrodlabs",
  assignees: [{ profile: testProfile, outcomeMemberActionHash: '124' }],
  editingPeers: [],
  setContent: () => {},
  setDescription: () => {},
  setGithubInputLinkText: () => {},
  updateOutcomeWithLatest: async () => {},
  onCreateTag: async () => {},
  updateOutcome: async () => {},
  createOutcomeMember: async () => {},
  deleteOutcomeMember: async () => {},
  startTitleEdit: () => {},
  endTitleEdit: () => {},
  startDescriptionEdit: () => {},
  endDescriptionEdit: () => {},
}
Primary.args = props
