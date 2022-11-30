import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import '../variables.scss'

import {
  DashboardListProject as DashboardListProjectComponent,
  DashboardListProjectProps,
} from '../routes/Dashboard/DashboardListProject'
import { PriorityMode } from '../types'
import { BrowserRouter } from 'react-router-dom'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Dashboard/DashboardListProject',
  component: DashboardListProjectComponent,
} as ComponentMeta<typeof DashboardListProjectComponent>

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof DashboardListProjectComponent> = (
  args
) => {
  return (
    <BrowserRouter>
      <DashboardListProjectComponent {...args} />
    </BrowserRouter>
  )
}

export const DashboardListProject = Template.bind({})

// 'single story hoist' (place the component at the 'top level' without nesting in the storybook menu)
DashboardListProject.storyName = 'DashboardListProject'
// More on args: https://storybook.js.org/docs/react/writing-stories/args
const args: DashboardListProjectProps = {
  updateRequired: true,
  project: {
    creatorAgentPubKey: '',
    createdAt: Date.now(),
    name: 'Test Project',
    image: '',
    passphrase: 'shdfsdjfhksdjg',
    isImported: false,
    priorityMode: PriorityMode.Universal,
    topPriorityOutcomes: [],
    isMigrated: false,
    actionHash: '2131rueskfjhrkes',
    cellId: 'hfsfjhsdhfj2y87318',
    presentMembers: [],
    members: [],
    entryPoints: [],
  },
  setShowInviteMembersModal: function (passphrase: string): void {
    throw new Error('Function not implemented.')
  },
  openProjectSettingsModal: function (projectCellId: string): void {
    throw new Error('Function not implemented.')
  }
}

DashboardListProject.args = args
