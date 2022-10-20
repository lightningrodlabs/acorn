import React, { useEffect, useState } from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import '../variables.scss'

import ButtonCheckbox from '../components/ButtonCheckbox/ButtonCheckbox'
import Icon from '../components/Icon/Icon'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Buttons/ButtonCheckbox',
  component: ButtonCheckbox,
} as ComponentMeta<typeof ButtonCheckbox>

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof ButtonCheckbox> = (args) => {
  const [selectedState, setSelectedState] = useState(args.isChecked)
  useEffect(() => {
    setSelectedState(args.isChecked)
  }, [args.isChecked])
  return (
    <ButtonCheckbox
      {...args}
      isChecked={selectedState}
      onChange={(state) => setSelectedState(state)}
    />
  )
}

export const Primary = Template.bind({})
Primary.storyName = 'ButtonCheckbox'
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Primary.args = {
  size: 'medium',
  isChecked: false,
  icon: <Icon name="leaf.svg" size="small not-hoverable" />,
  text: 'Checkbox',
}
