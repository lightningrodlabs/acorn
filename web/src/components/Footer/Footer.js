import React, { useState, useRef } from 'react'
import useOnClickOutside from 'use-onclickoutside'
import { NavLink, Route, useRouteMatch } from 'react-router-dom'
import Zoom from '../Zoom/Zoom.connector'
import './Footer.scss'
import Icon from '../Icon/Icon'
import Button from '../Button/Button'

import EntryPointPicker from '../EntryPointPicker/EntryPointPicker.connector'

function Footer() {
  const projectPage = useRouteMatch('/project/:projectId')
  const projectId = projectPage ? projectPage.params.projectId : null
  const mapPage = useRouteMatch('/project/:projectId/map')

  let bottomRightPanelClassName = 'bottom-right-panel'

  bottomRightPanelClassName =
    bottomRightPanelClassName + (mapPage ? '' : ' bottom-right-panel-not-map')

  const ref = useRef()
  useOnClickOutside(ref, () => setOpenEntryPointPicker(false))
  const [openEntryPointPicker, setOpenEntryPointPicker] = useState(false)

  return (
    <div className='footer' ref={ref}>
      <div className='bottom-left-panel'>
        <a
          href='https://github.com/h-be/acorn/issues/new'
          target='_blank'>
          <Button text='Report Issue' size='small' className='green' />
        </a>
      </div>
      {projectPage && (
        <div className={bottomRightPanelClassName}>
          {mapPage && <Zoom />}
        </div>
      )}
    </div>
  )
}

export default Footer
