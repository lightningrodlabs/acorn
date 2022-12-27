import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import '../variables.scss'

import UpdateModalComponent, {
  UpdateModalProps,
} from '../components/UpdateModal/UpdateModal'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Dashboard/UpdateModal',
  component: UpdateModalComponent,
} as ComponentMeta<typeof UpdateModalComponent>

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof UpdateModalComponent> = (args) => {
  return <UpdateModalComponent {...args} />
}

export const UpdateModal = Template.bind({})

// 'single story hoist' (place the component at the 'top level' without nesting in the storybook menu)
UpdateModal.storyName = 'UpdateModal'
// More on args: https://storybook.js.org/docs/react/writing-stories/args
const args: UpdateModalProps = {
  // assign props here
  show: true,
  onClose: function (): void {
    throw new Error('Function not implemented.')
  },
  releaseTag: 'v3.5.0-alpha',
  releaseSize: '120MB',
  heading: 'Update to newest version of Acorn',
  content: (
    <div>
      Update is required to access a shared project brought to the updated
      version by another team member. You can continue using your personal
      projects without the update. See <a>Release Notes & Changelog</a>.
    </div>
  ),
}
UpdateModal.args = args
