import React from 'react'
import Typography from '../Typography/Typography'
import './DashboardEmptyState.scss'

function DashboardEmptyState({ onJoinClick, onCreateClick }) {
  return (
    <div className="dashboard-empty-state-wrapper">
      <div className="dashboard-empty-state">
        <div className="dashboard-empty-state-squirrel-outer">
          <div className="dashboard-empty-state-squirrel-middle">
            <div className="dashboard-empty-state-squirrel-main clearfix">
              <div className="squirrel">
                <div className="tail">
                  <span className="circle"></span>
                  <span className="square">
                    <span className="tail-square-right"></span>
                  </span>
                </div>
                <span className="skin"></span>
                <span className="belly"></span>
                <span className="ear left"></span>
                <span className="ear right"></span>
                <span className="nose"></span>
                <div className="mouth">
                  <span className="tooth"></span>
                </div>
                <div className="eye left">
                  <span></span>
                </div>
                <div className="eye right">
                  <span></span>
                </div>
                <span className="leg left"></span>
                <span className="leg right"></span>
                <div className="nut">
                  <span className="hood"></span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Typography style="h2">
          Achieve your desired outcomes, big and small
        </Typography>
        <div className="dashboard-empty-state-description">
          <Typography style="body1">You currently have no projects.</Typography>
          <Typography style="body1">
            <a onClick={onCreateClick}> Create a new project </a>
            or <a onClick={onJoinClick}> join an existing one</a> to get started
            .
          </Typography>
        </div>
      </div>
    </div>
  )
}

export default DashboardEmptyState
