import React, { useEffect, useState } from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import '../variables.scss'

import ExpandChevron, { ExpandChevronProps} from '../components/ExpandChevron/ExpandChevron'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Buttons/ExpandChevron',
  component: ExpandChevron,
} as ComponentMeta<typeof ExpandChevron>

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof ExpandChevron> = (args) => {
  const [expanded, setExpanded] = useState(args.expanded)
  useEffect(() => {
    setExpanded(args.expanded)
  }, [args.expanded])
  return <div style={{width:100, height: 100}}><ExpandChevron {...args} expanded={expanded} onClick={() => setExpanded(!expanded)} /></div>
}

export const Primary = Template.bind({})
Primary.storyName = 'ExpandChevron'
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Primary.args = {
  // assign props here
  expanded: false,
  size: 'medium'
} as ExpandChevronProps
