import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'

import Icon from '../../../Icon/Icon'
import GuidebookNavLink from '../../../GuidebookNavLink/GuidebookNavLink'
import { GUIDE_IS_OPEN, CREATE_ENTRY_POINT_KEY } from '../../guideIsOpen'

// Guides
import projectsGuide from './HowTo.projects'
import cardsGuide from './HowTo.cards'
import connectionsGuide from './HowTo.connections'
import navigationGuide from './HowTo.navigation'
import universalGuide from './HowTo.universal'
import votebasedGuide from './HowTo.votebased'
import entrypointsGuide from './HowTo.entrypoints'
import mydataGuide from './HowTo.mydata'

const howTosItems = [
  projectsGuide,
  cardsGuide,
  connectionsGuide,
  navigationGuide,
  universalGuide,
  votebasedGuide,
  entrypointsGuide,
  mydataGuide,
]

const Content = ({ title, description }) => (
  <div className="guidebook-section">
    <div className="guidebook-section-title">{title}</div>
    <div className="guidebook-section-description">{description}</div>
  </div>
)

function NavItem({ navItem: { submenu, title }, expanded, expand }) {
  return (
    <section>
      <div className="nav-item" onClick={expand}>
        <Icon
          name={expanded ? 'chevron-down.svg' : 'chevron-right.svg'}
          size="small"
          className="grey"
        />
        {title}
      </div>
      <div className={`sidebar-submenu ${expanded ? 'active' : ''}`}>
        <ul>
          {submenu.map((subNavItem, i) => (
            <li key={i}>
              <GuidebookNavLink
                guidebookId={subNavItem.guide_id}
              >
                {subNavItem.title}
              </GuidebookNavLink>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function HowTosNav({ navList, openNav }) {
  // store false, or the index of the currently expanded nav item
  // only one can be expanded at a time this way
  const [expanded, setExpanded] = useState(false)

  // run a check any time the 'openNav' section key changes
  // to expand the nav item who has a currently showing
  // open entry, if any
  useEffect(() => {
    if (openNav) {
      navList.forEach((navItem, index) => {
        if (navItem.title === openNav.title) {
          setExpanded(index)
        }
      })
    }
  }, [openNav])
  return (
    <nav className="how-tos-nav">
      {navList.map((navItem, i) => (
        <NavItem
          key={i}
          navItem={navItem}
          expanded={expanded === i}
          expand={() => (expanded === i ? setExpanded(false) : setExpanded(i))}
        />
      ))}
    </nav>
  )
}

// DEFAULT / TOP LEVEL EXPORT
export default function HowTos() {
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const openEntryKey = searchParams.get(GUIDE_IS_OPEN)
  function isOpenEntry(subItem) {
    return subItem.guide_id === openEntryKey
  }
  const openNav = howTosItems.find((navItem) => {
    return navItem.submenu.find(isOpenEntry)
  })
  const openEntry = openNav && openNav.submenu.find(isOpenEntry)

  return (
    <div className="howtos">
      <HowTosNav navList={howTosItems} openNav={openNav} />
      {openEntry && (
        <Content title={openEntry.title} description={openEntry.description} />
      )}
    </div>
  )
}
