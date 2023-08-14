import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import '../variables.scss'

import AddOutcomeChildInputComponent, {
  AddOutcomeChildInputProps,
} from '../components/AddOutcomeChildInput/AddOutcomeChildInput'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Example/AddOutcomeChildInput',
  component: AddOutcomeChildInputComponent,
} as ComponentMeta<typeof AddOutcomeChildInputComponent>

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof AddOutcomeChildInputComponent> = (
  args
) => {
  return <AddOutcomeChildInputComponent {...args} />
}

export const AddOutcomeChildInput = Template.bind({})

// 'single story hoist' (place the component at the 'top level' without nesting in the storybook menu)
AddOutcomeChildInput.storyName = 'AddOutcomeChildInput'
// More on args: https://storybook.js.org/docs/react/writing-stories/args
const args: AddOutcomeChildInputProps = {
  // assign props here
}
AddOutcomeChildInput.args = args
