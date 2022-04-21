import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import '../variables.scss'

import ReadOnlyInfo, {
  ReadOnlyInfoProps,
} from '../components/ReadOnlyInfo/ReadOnlyInfo'
import Icon from '../components/Icon/Icon'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Expanded View/ReadOnlyInfo',
  component: ReadOnlyInfo,
} as ComponentMeta<typeof ReadOnlyInfo>

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof ReadOnlyInfo> = (args) => {
  return <ReadOnlyInfo {...args} />
}

export const Primary = Template.bind({})
Primary.storyName = 'ReadOnlyInfo'
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Primary.args = {
  infos: [
    {
      text: '12 comments',
      // @ts-ignore
      icon: <Icon name="activity-history.svg" />,
    },
    {
      text: '12 comments',
      // @ts-ignore
      icon: <Icon name="activity-history.svg" />,
    },
  ],
} as ReadOnlyInfoProps
