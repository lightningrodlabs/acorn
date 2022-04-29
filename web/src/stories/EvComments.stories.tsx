import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import '../variables.scss'

import EvComments, {
  EvCommentsProps,
} from '../components/ExpandedViewMode/EVMiddleColumn/TabContent/EvComments/EvComments.component'
import testComments from './testComments'

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
  outcomeHeaderHash: '1243523',
  activeAgentPubKey: '1245314',
  profiles: {
    '389457985y498592847': {
      firstName: 'Pegah',
      lastName: 'Vaezi',
      handle: '389457985y498592847',
      status: 'Online',
      avatarUrl:
        'https://i.pinimg.com/550x/c0/3d/3f/c03d3f965a8091206f4a0e742bb97c9f.jpg',
      agentPubKey: '389457985y498592847',
      isImported: false,
    },
  },

  comments: testComments,
  createOutcomeComment: async () => {},
}
Primary.args = props
