import React, { useState } from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import '../variables.scss'

import Typography from '../components/Typography/Typography'
import Icon from '../components/Icon/Icon'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Example/Typography',
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
      <Typography style="h1" text={headingText} />
      <Typography style="h2" text={headingText} />
      <Typography style="h3" text={headingText} />
      <Typography style="h4" text={headingText} />
      <Typography style="h5" text={headingText} />
      <Typography style="h6" text={headingText} />
      <Typography style="h7" text={headingText} />
      <Typography style="h8" text={headingText} />
      <Typography style="subtitle1" text={subtitleText} />
      <Typography style="subtitle2" text={subtitleText} />
      <Typography style="caption1" text="8 members" />
      <Typography style="caption2" text="This outcome has no children." />
      <Typography
        style="body1"
        text="Acorn no longer uses a legacy unmaintained library and instead it is replaced with a modern typescript API definitions. "
      />
      <Typography style="body2" text="Export as JASON (Importable) " />
    </>
  )
}

export const Primary = Template.bind({})
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Primary.args = {
  style: 'h1',
  text: 'Heading1',
}
