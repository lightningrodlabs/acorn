import React, { useState } from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import '../variables.scss'

import Breadcrumbs from '../components/Breadcrumbs/Breadcrumbs'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Expanded View/Breadcrumbs',
  component: Breadcrumbs,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  // argTypes: {
  //  backgroundColor: { control: 'color' },
  // },
} as ComponentMeta<typeof Breadcrumbs>

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof Breadcrumbs> = (args) => {
  const [selectedState, setSelectedState] = useState(false)
  return (
    <Breadcrumbs
      {...args}
      isChecked={selectedState}
      onChange={(state) => setSelectedState(state)}
    />
  )
}

export const Primary = Template.bind({})
Primary.storyName = 'Breadcrumbs'
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Primary.args = {
}