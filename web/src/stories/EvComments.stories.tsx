import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import '../variables.scss'

import EvComments, {
  EvCommentsProps,
} from '../components/ExpandedViewMode/EVMiddleColumn/TabContent/EvComments/EvComments.component'
import testComments from './testData/testComments'
import testProfile from './testData/testProfile'

// More on args: https://storybook.js.org/docs/react/writing-stories/args

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Expanded View/Tabs/EvComments',
  component: EvComments,
} as ComponentMeta<typeof EvComments>

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof EvComments> = (args) => {
  return <EvComments {...args} />
}

export const Primary = Template.bind({})
Primary.storyName = 'EvComments'

const props: EvCommentsProps = {
  projectId: '1241241',
  outcomeContent:
    'This is the title of an outcome that we are viewing the comments of',
  outcomeActionHash: '1243523',
  activeAgentPubKey: '1245314',
  profiles: {
    '389457985y498592847': testProfile,
  },
  comments: testComments,
  createOutcomeComment: async () => {},
}
Primary.args = props
