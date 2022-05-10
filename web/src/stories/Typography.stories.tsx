import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import '../variables.scss'

import Typography from '../components/Typography/Typography'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Typography/Typography',
  component: Typography,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {
    backgroundColor: { control: 'color' },
  },
} as ComponentMeta<typeof Typography>

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof Typography> = (args) => {
  const headingText = `New API in typescript definitions are written and implemented`
  const subtitleText = `New API in typescript definitions are written and implemented`
  return (
    <>
      <Typography style="h1" text={`h1: ${headingText}`} />
      <Typography style="h2" text={`h2: ${headingText}`} />
      <Typography style="h3" text={`h3: ${headingText}`} />
      <Typography style="h4" text={`h4: ${headingText}`} />
      <Typography style="h5" text={`h5: ${headingText}`} />
      <Typography style="h6" text={`h6: ${headingText}`} />
      <Typography style="h7" text={`h7: ${headingText}`} />
      <Typography style="h8" text={`h8: ${headingText}`} />
      <Typography style="subtitle1" text={`subtitle1: ${subtitleText}`} />
      <Typography style="subtitle2" text={`subtitle2: ${subtitleText}`} />
      <Typography style="caption1" text="caption1: 8 members" />
      <Typography style="caption2" text="caption 2: This outcome has no children." />
      <Typography
        style="body1"
        text="body1: Acorn no longer uses a legacy unmaintained library and instead it is replaced with a modern typescript API definitions. "
      />
      <Typography style="body2" text="body2: Export as JSON (Importable) " />
    </>
  )
}

export const Primary = Template.bind({})
Primary.storyName = 'Typography'
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Primary.args = {
  style: 'h1',
  text: 'Heading1',
}
