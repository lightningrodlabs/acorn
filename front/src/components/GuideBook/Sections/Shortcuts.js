import React from 'react'
import Icon from '../../Icon/Icon'

const shortcutsItems = [
  {
    title: 'Modifications',
    shortcuts: [
      {
        shortcutKey: 'g + click',
        shortcutTitle: 'Create a card',
      },
      {
        shortcutKey: 'Select a card + g + click',
        shortcutTitle: 'Create a child card',
      },
      {
        shortcutKey: 'escape',
        shortcutTitle: 'Cancel card/connection creation',
      },
      {
        shortcutKey: 'e',
        shortcutTitle: 'Enter expanded view (on a selected card)',
      },
      {
        shortcutKey: 'delete',
        shortcutTitle: 'Archive card or connection',
      },
    ],
  },
  {
    title: 'Selection',
    shortcuts: [
      {
        shortcutKey: 'click',
        shortcutTitle: 'Select one card',
      },
      {
        shortcutKey: 'shift + click',
        shortcutTitle: 'Select/deselect card',
      },
      {
        shortcutKey: 'shift + click + drag',
        shortcutTitle: 'Select multiple in box',
      },
    ],
  },
  // {
  //   title: 'Tools',
  //   shortcuts: [
  //     {
  //       shortcutKey: '⌘ + Z',
  //       shortcutTitle: 'Undo',
  //     },
  //     {
  //       shortcutKey: '⌘ + shift + Z',
  //       shortcutTitle: 'Redo',
  //     },
  //   ],
  // },
  // {
  //   title: 'Navigation',
  //   shortcuts: [
  //     {
  //       shortcutKey: '+',
  //       shortcutTitle: 'Zoom in',
  //     },
  //     {
  //       shortcutKey: '–',
  //       shortcutTitle: 'Zoom out',
  //     },
  //     {
  //       shortcutKey: '← → ↑ ↓',
  //       shortcutTitle: 'Pan around canvas',
  //     },
  //   ],
  // },
]

// component
const Content = ({ shortcutKey, shortcutTitle }) => (
  <div className='guidebook-shortcut-row'>
    <div className='guidebook-shortcut-title'>{shortcutTitle}</div>
    <div className='guidebook-shortcut-key'>{shortcutKey}</div>
  </div>
)

export default function Shortcuts() {
  return shortcutsItems.map((category, index) => {
    return (
      <div className='guidebook-shortcut-category-wrapper' key={index}>
        <div className='guidebook-shortcut-category-title'>
          {category.title}
        </div>
        {category.shortcuts.map((shortcut, index) => {
          return (
            <Content
              key={index}
              shortcutKey={shortcut.shortcutKey}
              shortcutTitle={shortcut.shortcutTitle}
            />
          )
        })}
      </div>
    )
  })
}
