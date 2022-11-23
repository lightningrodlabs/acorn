import React, { useState } from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import '../variables.scss'

import UpdateBar, {
  UpdateBarProps,
} from '../components/UpdateBar/UpdateBar'


// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Dashboard/UpdateBar',
  component: UpdateBar,
} as ComponentMeta<typeof UpdateBar>

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof UpdateBar> = (args) => {
  return <UpdateBar {...args} />
}

export const Primary = Template.bind({})
Primary.storyName = 'UpdateBar'
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Primary.args = {
  active: true,
  setShowUpdatePromptModal: false,
  text: '🎉  A new update for Acorn is available.',
  migratedSharedProjectText: ' Update is required to access a shared project brought to the updated version by another team member.',
  buttonPrimaryText: 'Update Now',
  buttonSecondaryText: 'Changelog',
} as unknown as UpdateBarProps
