import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import '../variables.scss'

import ProjectMigratedModalComponent, {
  ProjectMigratedModalProps,
} from '../components/ProjectMigratedModal/ProjectMigratedModal'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Example/ProjectMigratedModal',
  component: ProjectMigratedModalComponent,
} as ComponentMeta<typeof ProjectMigratedModalComponent>

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof ProjectMigratedModalComponent> = (
  args
) => {
  return <ProjectMigratedModalComponent {...args} />
}

export const ProjectMigratedModal = Template.bind({})

// 'single story hoist' (place the component at the 'top level' without nesting in the storybook menu)
ProjectMigratedModal.storyName = 'ProjectMigratedModal'
// More on args: https://storybook.js.org/docs/react/writing-stories/args
const args: ProjectMigratedModalProps = {
  // assign props here
}
ProjectMigratedModal.args = args
