import React, { useState, useRef } from 'react'
import useOnClickOutside from 'use-onclickoutside'
import { NavLink, Route, useRouteMatch } from 'react-router-dom'
import Zoom from '../Zoom/Zoom'
import './Footer.css'
import Icon from '../Icon/Icon'
import Button from '../Button/Button'

import EntryPointPicker from '../EntryPointPicker/EntryPointPicker'

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
        <Route path='/project'>
          <div className='bottom-left-panel-entry-points'>
            <Icon
              name='door-open.png'
              size=''
              className={`grey ${openEntryPointPicker ? 'active' : ''}`}
              withTooltipTop
              tooltipText='entry points'
              onClick={() => setOpenEntryPointPicker(!openEntryPointPicker)}
            />
            {/* <img src='img/door-open.png' /> entry points */}
          </div>
          <EntryPointPicker
            isOpen={openEntryPointPicker}
            onClose={() => setOpenEntryPointPicker(false)}
          />
        </Route>
      </div>
      {projectPage && (
        <div className={bottomRightPanelClassName}>
          {mapPage && <Zoom />}
          <div className='bottom-right-panel-view-modes'>
            <NavLink
              to={`/project/${projectId}/map`}
              activeClassName='view-mode-active'
              className='view-mode-link'>
              <Icon
                name='map.svg'
                size=''
                className='grey'
                withTooltipTop
                tooltipText='map view'
              />
            </NavLink>
            <NavLink
              to={`/project/${projectId}/priority`}
              activeClassName='view-mode-active'
              className='view-mode-link'>
              <Icon
                name='priority.svg'
                size='view-mode'
                className='grey'
                withTooltipTop
                tooltipText='priority view'
              />
            </NavLink>
            {/* <Icon name='timeline.svg' className='grey' size='view-mode' /> */}
          </div>
        </div>
      )}
    </div>
  )
}

export default Footer
