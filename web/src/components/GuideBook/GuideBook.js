import React, { useState } from 'react'
import './GuideBook.css'
import Tabs from './Tabs/Tabs'
// import GettingStarted from './Sections/GettingStarted'
import HowTos from './Sections/HowTos/index'
import Shortcuts from './Sections/Shortcuts'

export default function GuideBook() {
  const [tabSelected, setTabSelected] = useState(0)
  const tabs = [
    //{ title: 'Getting Started' },
    { title: 'How To' },
    { title: 'Shortcuts' },
    // { title: 'FAQ' },
  ]
  return (
    <div className='guidebook-outer-wrapper'>
      <div className='guidebook-wrapper'>
        <div className='guidebook-title'>Guidebook</div>
        <Tabs tabs={tabs} selected={tabSelected} toSelectTab={setTabSelected}>
          <HowTos />
          <Shortcuts />
        </Tabs>
      </div>
    </div>
  )
}
