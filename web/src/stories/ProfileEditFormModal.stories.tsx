import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import '../variables.scss'

import ProfileEditFormModalComponent, {
  ProfileEditFormModalProps,
} from '../components/ProfileEditFormModal/ProfileEditFormModal'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Example/ProfileEditFormModal',
  component: ProfileEditFormModalComponent,
} as ComponentMeta<typeof ProfileEditFormModalComponent>

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof ProfileEditFormModalComponent> = (args) => {
  return <ProfileEditFormModalComponent {...args} />
}

export const ProfileEditFormModal = Template.bind({})

// 'single story hoist' (place the component at the 'top level' without nesting in the storybook menu)
ProfileEditFormModal.storyName = 'ProfileEditFormModal'
// More on args: https://storybook.js.org/docs/react/writing-stories/args
const args: ProfileEditFormModalProps = {
  // assign props here
}
ProfileEditFormModal.args = args
