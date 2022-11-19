import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import '../variables.scss'

import ContextMenuComponent, {
  ContextMenuProps,
} from '../components/ContextMenu/ContextMenu'
import Icon from '../components/Icon/Icon'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Map View/ContextMenu',
  component: ContextMenuComponent,
} as ComponentMeta<typeof ContextMenuComponent>

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof ContextMenuComponent> = (args) => {
  return <ContextMenuComponent {...args} />
}

export const ContextMenu = Template.bind({})

// 'single story hoist' (place the component at the 'top level' without nesting in the storybook menu)
ContextMenu.storyName = 'ContextMenu'
// More on args: https://storybook.js.org/docs/react/writing-stories/args
const args: ContextMenuProps = {
  menuWidth: '10.5rem',
  outcomeActionHash: 'jfiosdjfoshig1231314',
  actions: [
    {
      icon: <Icon name="leaf.svg" size="small not-hoverable" className='white' />,
      text: 'Collapse Children',
    },
    {
      icon: <Icon name="text-align-left.svg" size="small not-hoverable" className='white' />,
      text: 'Copy Statement',
    },
  ],
}
ContextMenu.args = args
