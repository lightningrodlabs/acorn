import React, { useState } from 'react'
import {
  Switch,
  Route,
  NavLink,
  useLocation,
  withRouter
} from 'react-router-dom'
import onClickOutside from 'react-onclickoutside'
import GuideBook from '../GuideBook/GuideBook'
import { GUIDE_IS_OPEN } from '../GuideBook/guideIsOpen'
import './Header.css'
import Avatar from '../Avatar/Avatar'
import Icon from '../Icon/Icon'
import ListExport from '../ListExport/ListExport'
import Modal from '../Modal/Modal'
import UpdateBar from '../UpdateBar/UpdateBar'

function ActiveEntryPoint ({ entryPoint, activeEntryPointAddresses }) {
  const location = useLocation()
  const entryPointsAbsentThisOne = activeEntryPointAddresses
    .filter(address => address !== entryPoint.address)
    .join(',')
  return (
    <div className='active-entry-point'>
      <img src='img/door-open.png' />
      {/* add title because text-overflow: ellipsis */}
      <div className='active-entry-point-content' title={entryPoint.content}>
        {entryPoint.content}
      </div>
      <NavLink
        to={`${location.pathname}?entryPoints=${entryPointsAbsentThisOne}`}
        className='active-entry-point-close'
      >
        <Icon name='x.svg' size='very-small-close' className='grey' />
      </NavLink>
    </div>
  )
}

class Header extends React.Component {
  constructor (props) {
    super(props)
    this.handleClickOutside = this.handleClickOutside.bind(this)
    this.clickAvatar = this.clickAvatar.bind(this)
    this.clickStatus = this.clickStatus.bind(this)
    this.changeStatus = this.changeStatus.bind(this)
    this.clickProfile = this.clickProfile.bind(this)
    this.clickPreferences = this.clickPreferences.bind(this)
    this.clickSearch = this.clickSearch.bind(this)
    this.clickExport = this.clickExport.bind(this)
    this.saveStatus = this.saveStatus.bind(this)
    this.hover = this.hover.bind(this)
    this.handleStatusEnter = this.handleStatusEnter.bind(this)
    this.handleStatusLeave = this.handleStatusLeave.bind(this)
    this.closeGuidebook = this.closeGuidebook.bind(this)

    this.state = {
      online: {},
      isStatusHover: false,
      isStatusOpen: false,
      lista: {},
      avatar: false,
      isExportOpen: false,
      listaProfile: {},
      listaExport: {}
    }
  }

  componentDidMount () {
    this.changeStatus(
      this.props.whoami ? this.props.whoami.entry.status : 'Online'
    )

    this.setState({
      lista: [
        { color: 'green', img: 'checkmark-circle.svg', title: 'Online' },
        { color: 'yellow', img: 'user-status-away.svg', title: 'Away' },
        { color: 'gray', img: 'user-status-offline.svg', title: 'Offline' }
      ],
      avatar: false,
      listaProfile: [
        { title: 'Profile Settings', click: this.clickProfile },
        { title: 'Preferences', click: this.clickPreferences }
      ],
      listaExport: [
        {
          title: 'Export as JSON (Importable)',
          type: 'json',
          download: 'table.json'
        },
        { title: 'Export as CSV', type: 'csv', download: 'table.csv' }
      ]
    })
  }

  handleClickOutside (e) {
    this.setState({
      isProfileOpen: false,
      isExportOpen: false,
      isStatusOpen: false
    })
  }
  clickProfile (e) {
    this.props.setShowProfileEditForm(true)
    this.setState({
      isProfileOpen: false,
      isExportOpen: false,
      isStatusOpen: false
    })
  }
  clickPreferences (e) {
    this.props.setShowPreferences(true)
    this.setState({
      isProfileOpen: false,
      isExportOpen: false,
      isStatusOpen: false,
      isGuideOpen: false
    })
  }
  clickAvatar (e) {
    this.setState({
      isProfileOpen: !this.state.isProfileOpen,
      isExportOpen: false,
      isStatusOpen: false
    })
  }
  hover (bool) {
    this.setState({ avatar: bool })
  }

  clickStatus (e) {
    this.setState({
      isStatusOpen: !this.state.isStatusOpen,
      isExportOpen: false,
      isProfileOpen: false
    })
  }
  clickExport (e) {
    this.setState({
      isExportOpen: !this.state.isExportOpen,
      isStatusOpen: false,
      isProfileOpen: false
    })
  }
  clickSearch (e) {}
  saveStatus (status) {
    this.props.updateStatus(status)
    this.changeStatus(status)
  }
  changeStatus (status) {
    switch (status) {
      case 'Online':
        this.setState({
          online: { color: 'green', img: 'checkmark-circle.svg' }
        })
        break
      case 'Away':
        this.setState({
          online: { color: 'yellow', img: 'user-status-away.svg' }
        })
        break
      case 'Offline':
        this.setState({
          online: { color: 'gray', img: 'user-status-offline.svg' }
        })
        break
      default:
        console.error('not defined')
        break
    }
    this.setState({
      isProfileOpen: false,
      isStatusOpen: false
    })
  }
  handleStatusEnter () {
    this.setState({ isStatusHover: true })
  }
  handleStatusLeave () {
    this.setState({ isStatusHover: false })
  }
  closeGuidebook () {
    const pathWithoutGuidebook = this.props.location.pathname
    this.props.history.push(pathWithoutGuidebook)
  }
  render () {
    const activeEntryPointAddresses = this.props.activeEntryPoints.map(
      entryPoint => entryPoint.address
    )

    // check the url for GUIDE_IS_OPEN
    // and affect the state
    const searchParams = new URLSearchParams(this.props.location.search)
    const isGuideOpen = !!searchParams.get(GUIDE_IS_OPEN)

    return (
      <div className='header-wrapper'>
        <UpdateBar
          active={this.props.showUpdateBar}
          onClose={() => this.props.setShowUpdateBar(false)}
          setShowUpdatePromptModal={this.props.setShowUpdatePromptModal}
        />
        <div className='header'>
          <div className='top-left-panel'>
            <NavLink to='/' className='home-link logo'>
              <Icon name='acorn-logo-stroked.svg' className='not-hoverable' />
              <p className='logo-name'>acorn</p>
            </NavLink>
            {this.props.whoami && (
              <Route path='/project'>
                <div className='current-project-wrapper'>
                  <div className='current-project-content'>
                    <Switch>
                      <Route
                        path='/project/:projectId/map'
                        render={() => (
                          <Icon
                            name='map.svg'
                            className='view-mode grey not-hoverable'
                          />
                        )}
                      />
                      <Route
                        path='/project/:projectId/priority'
                        render={() => (
                          <Icon
                            name='priority.svg'
                            className='view-mode grey not-hoverable'
                          />
                        )}
                      />
                    </Switch>
                    <div className='current-project-name'>
                      {this.props.projectName}
                    </div>
                    <div className='divider-line'></div>
                    <div className='export-wrapper'>
                      <Icon
                        withTooltip
                        tooltipText='export'
                        name='export.svg'
                        size='header'
                        className={this.state.isExportOpen ? 'purple' : ''}
                        onClick={this.clickExport}
                      />
                      {this.state.isExportOpen && (
                        <ul className='export-list-wrapper'>
                          {Object.keys(this.state.listaExport).map(key => (
                            <li key={key}>
                              <ListExport
                                type={this.state.listaExport[key].type}
                                title={this.state.listaExport[key].title}
                                download={this.state.listaExport[key].download}
                              />
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
                {/* Current Entry Points Tab */}
                {this.props.activeEntryPoints.map(entryPoint => (
                  <ActiveEntryPoint
                    key={entryPoint.address}
                    entryPoint={entryPoint}
                    activeEntryPointAddresses={activeEntryPointAddresses}
                  />
                ))}
              </Route>
            )}
          </div>
          {this.props.whoami && (
            <div className='top-right-panel'>
              {/* <Icon name="search-line.svg" onClick={this.clickSearch}/> */}
              <Route path='/project'>
                {/* open or close the guidebook, depending on if it */}
                {/* is currently open or closed */}
                <NavLink
                  className='top-right-panel-icon'
                  to={`${this.props.location.pathname}${
                    isGuideOpen ? '' : '?' + GUIDE_IS_OPEN + '=1'
                  }`}
                >
                  <Icon name='guidebook.svg' className='top-right-panel-icon' />
                </NavLink>
              </Route>
              <div
                className={`avatar-and-status-wrapper ${this.state.online.color}`}
              >
                <div
                  className='avatar-container'
                  onMouseEnter={e => {
                    this.hover(true)
                  }}
                  onMouseLeave={e => {
                    this.hover(false)
                  }}
                >
                  <Avatar
                    first_name={this.props.whoami.entry.first_name}
                    last_name={this.props.whoami.entry.last_name}
                    avatar_url={this.props.whoami.entry.avatar_url}
                    highlighted={this.state.isProfileOpen || this.state.avatar}
                    clickable
                    onClick={this.clickAvatar}
                  />
                </div>

                <span
                  className='user-status-icon-wrapper'
                  onMouseEnter={this.handleStatusEnter}
                  onMouseLeave={this.handleStatusLeave}
                >
                  {!this.state.isStatusOpen && !this.state.isStatusHover && (
                    <Icon
                      name={this.state.online.img}
                      onClick={this.clickStatus}
                      className='user-status white'
                    />
                  )}
                  {(this.state.isStatusOpen || this.state.isStatusHover) && (
                    <Icon
                      name='user-status-hover.svg'
                      onClick={this.clickStatus}
                      className='user-status white not-hoverable'
                    />
                  )}
                </span>
              </div>
              {/* Guidebook */}
              <Route path='/project'>
                <Modal
                  className='guidebook-modal'
                  white
                  active={isGuideOpen}
                  onClose={this.closeGuidebook}
                >
                  <GuideBook />
                </Modal>
              </Route>
              {this.state.isProfileOpen && (
                <div className='profile-wrapper'>
                  {Object.keys(this.state.listaProfile).map(key => (
                    <ListProfile
                      key={key}
                      title={this.state.listaProfile[key].title}
                      click={this.state.listaProfile[key].click}
                    />
                  ))}
                </div>
              )}
              {this.state.isStatusOpen && (
                <div className='user-status-wrapper'>
                  {Object.keys(this.state.lista).map(key => (
                    <ListStatus
                      key={key}
                      img={this.state.lista[key].img}
                      color={this.state.lista[key].color}
                      title={this.state.lista[key].title}
                      changeStatus={this.saveStatus}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }
}
const ListStatus = props => {
  return (
    <button
      className={props.color + ' btn'}
      onClick={color => {
        props.changeStatus(props.title)
      }}
    >
      <Icon name={props.img} className='user-status white not-hoverable' />
      <p>{props.title}</p>
    </button>
  )
}
const ListProfile = props => {
  return (
    <button onClick={props.click}>
      <p>{props.title}</p>
    </button>
  )
}

export default withRouter(onClickOutside(Header))
