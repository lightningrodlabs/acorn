import React from 'react'
import './DashboardEmptyState.scss'

function DashboardEmptyState({ onJoinClick, onCreateClick }) {
  return (
    <div className='dashboard-empty-state-wrapper'>
      <div className='dashboard-empty-state'>
        <div className='dashboard-empty-state-squirrel-outer'>
          <div className='dashboard-empty-state-squirrel-middle'>
            <div className='dashboard-empty-state-squirrel-main clearfix'>
              <div className='squirrel'>
                <div className='tail'>
                  <span className='circle'></span>
                  <span className='square'>
                    <span className='tail-square-right'></span>
                  </span>
                </div>
                <span className='skin'></span>
                <span className='belly'></span>
                <span className='ear left'></span>
                <span className='ear right'></span>
                <span className='nose'></span>
                <div className='mouth'>
                  <span className='tooth'></span>
                </div>
                <div className='eye left'>
                  <span></span>
                </div>
                <div className='eye right'>
                  <span></span>
                </div>
                <span className='leg left'></span>
                <span className='leg right'></span>
                <div className='nut'>
                  <span className='hood'></span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='dashboard-empty-state-heading'>Let's get started!</div>
        <div className='dashboard-empty-state-description'>
          You currently have no projects. <br /> Start by
          <a className='description-link' onClick={onCreateClick}>
            {' '}
            creating a new project{' '}
          </a>
          or{' '}
          <a className='description-link' onClick={onJoinClick}>
            {' '}
            joining an existing one
          </a>
          .
        </div>
      </div>
    </div>
  )
}

export default DashboardEmptyState
