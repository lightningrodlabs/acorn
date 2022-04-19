import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import '../variables.scss'

import AvatarsList from '../components/AvatarsList/AvatarsList'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Example/AvatarsList',
  component: AvatarsList,
} as ComponentMeta<typeof AvatarsList>

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof AvatarsList> = (args) => {
  return <AvatarsList {...args} />
}

export const Primary = Template.bind({})
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Primary.args = {
  showInviteButton: true,
  profiles: [
    // Profile 1
    {
      firstName: 'Pegah',
      lastName: 'Vaezi',
      handle: '389457985y498592847',
      status: 'Online',
      avatarUrl:
        'https://i.pinimg.com/550x/c0/3d/3f/c03d3f965a8091206f4a0e742bb97c9f.jpg',
      agentPubKey: '389457985y498592847',
      isImported: false,
    },
    // Profile 2
    {
      firstName: 'Pegah',
      lastName: 'Vaezi',
      handle: '389457985y498592847',
      status: 'Online',
      avatarUrl:
        'https://i.pinimg.com/550x/c0/3d/3f/c03d3f965a8091206f4a0e742bb97c9f.jpg',
      agentPubKey: '389457985y498592847',
      isImported: false,
    },

    // Profile 3
    {
      firstName: 'Pegah',
      lastName: 'Vaezi',
      handle: '389457985y498592847',
      status: 'Online',
      avatarUrl:
        'https://i.pinimg.com/550x/c0/3d/3f/c03d3f965a8091206f4a0e742bb97c9f.jpg',
      agentPubKey: '389457985y498592847',
      isImported: false,
    },

    // Profile 4
    {
      firstName: 'Pegah',
      lastName: 'Vaezi',
      handle: '389457985y498592847',
      status: 'Online',
      avatarUrl:
        'https://i.pinimg.com/550x/c0/3d/3f/c03d3f965a8091206f4a0e742bb97c9f.jpg',
      agentPubKey: '389457985y498592847',
      isImported: false,
    },
  ],
}
