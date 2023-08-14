import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import '../variables.scss'

import PeoplePicker, {
  PeoplePickerProps,
} from '../components/PeoplePicker/PeoplePicker'
import testProfile, {
  testProfileIsImported,
  testProfileIsOffline,
} from './testData/testProfile'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Expanded View/PeoplePicker',
  component: PeoplePicker,
} as ComponentMeta<typeof PeoplePicker>

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof PeoplePicker> = (args) => {
  return <PeoplePicker {...args} />
}

export const Primary = Template.bind({})
Primary.storyName = 'PeoplePicker'
// More on args: https://storybook.js.org/docs/react/writing-stories/args
const args: PeoplePickerProps = {
  projectId: '',
  onClose: function (): void {
    throw new Error('Function not implemented.')
  },
  activeAgentPubKey: '',
  people: [
    { ...testProfile, isOutcomeMember: true, outcomeMemberActionHash: '' },
    {
      ...testProfileIsImported,
      isOutcomeMember: true,
      outcomeMemberActionHash: '',
    },
    {
      ...testProfileIsOffline,
      isOutcomeMember: false,
      outcomeMemberActionHash: '',
    },
  ],
  outcomeActionHash: '',
  createOutcomeMember: function (
    outcomeActionHash: string,
    memberAgentPubKey: string,
    creatorAgentPubKey: string
  ): Promise<void> {
    throw new Error('Function not implemented.')
  },
  deleteOutcomeMember: function (actionHash: string): Promise<void> {
    throw new Error('Function not implemented.')
  },
}

Primary.args = args
