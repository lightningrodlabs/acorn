import React, { useState } from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import '../variables.scss'

import Breadcrumbs, {
  BreadcrumbsProps,
} from '../components/Breadcrumbs/Breadcrumbs'
import {
  testBigAchievedOutcome,
  testBigNotAchievedOutcome,
  testBigPartiallyAchievedOutcome,
  testSmallNotAchievedOutcome,
} from './testData/testOutcomes'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Expanded View/Breadcrumbs',
  component: Breadcrumbs,
} as ComponentMeta<typeof Breadcrumbs>

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof Breadcrumbs> = (args) => {
  return <Breadcrumbs {...args} />
}

export const Primary = Template.bind({})
Primary.storyName = 'Breadcrumbs'
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Primary.args = {
  outcomeAndAncestors: [
    testBigAchievedOutcome,
    testBigNotAchievedOutcome,
    testBigPartiallyAchievedOutcome,
    testSmallNotAchievedOutcome,
  ],
} as BreadcrumbsProps
