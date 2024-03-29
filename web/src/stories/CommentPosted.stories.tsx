import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import '../variables.scss'

import CommentPosted from '../components/CommentPosted/CommentPosted'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Comments/CommentPosted',
  component: CommentPosted,
} as ComponentMeta<typeof CommentPosted>

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof CommentPosted> = (args) => {
  return <CommentPosted {...args} />
}

export const Primary = Template.bind({})
Primary.storyName = 'CommentPosted'
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Primary.args = {
  creator: {
    firstName: 'Pegah',
    lastName: 'Vaezi',
    handle: '389457985y498592847',
    status: 'Online',
    avatarUrl:
      'https://i.pinimg.com/550x/c0/3d/3f/c03d3f965a8091206f4a0e742bb97c9f.jpg',
    agentPubKey: '389457985y498592847',
    isImported: false,
  },
  comment: {
    outcomeActionHash: '389457985y498592847',
    content:
      'can anyone here help me with several google analytics account setups? I need some training and have clients using square and wordpress. I used to just rely on monster insights plug-in but with GA4 I think things have changed. HALP!',
    creatorAgentPubKey: '389457985y498592847',
    unixTimestamp: Date.now(), //f64,
    isImported: false,
  },
}
