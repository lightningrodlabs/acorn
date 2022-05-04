import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import '../variables.scss'

import EditingOverlayComponent, {
  EditingOverlayProps,
} from '../components/EditingOverlay/EditingOverlay'
import testProfile from './testData/testProfile'
import MarkdownDescription from '../components/MarkdownDescription/MarkdownDescription'
import Typography from '../components/Typography/Typography'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Expanded View/EditingOverlay',
  component: EditingOverlayComponent,
} as ComponentMeta<typeof EditingOverlayComponent>

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof EditingOverlayComponent> = (args) => {
  return (
    <div style={{ padding: '100px' }}>
      <EditingOverlayComponent {...args}>
        <Typography style="h1">Hi</Typography>
      </EditingOverlayComponent>
    </div>
  )
}

export const BeingEdited = Template.bind({})
// More on args: https://storybook.js.org/docs/react/writing-stories/args
const args: EditingOverlayProps = {
  isBeingEditedByOther: true,
  personEditing: { ...testProfile, headerHash: '1248124' },
}
BeingEdited.args = args

export const NotBeingEdited = Template.bind({})
// More on args: https://storybook.js.org/docs/react/writing-stories/args
const notBeingEditedArgs: EditingOverlayProps = {
  isBeingEditedByOther: false,
  personEditing: null,
}
NotBeingEdited.args = notBeingEditedArgs
