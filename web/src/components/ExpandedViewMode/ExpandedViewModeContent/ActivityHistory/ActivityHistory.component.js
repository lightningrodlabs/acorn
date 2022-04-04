import React, { Component } from 'react'
import './ActivityHistory.scss'
import moment from 'moment'
import Avatar from '../../../Avatar/Avatar'
import Icon from '../../../Icon/Icon'
import StatusIcon from '../../../StatusIcon/StatusIcon'
import HierarchyIcon from '../../../HierarchyIcon/HierarchyIcon'

function checkTimeframeSame(oldTimeframe, newTimeframe) {
  if (newTimeframe && !oldTimeframe) {
    return false
  } else if (oldTimeframe && !newTimeframe) {
    return false
  } else if (!oldTimeframe && !newTimeframe) {
    return true
  } else if (
    oldTimeframe.fromDate === newTimeframe.fromDate &&
    oldTimeframe.toDate === newTimeframe.toDate
  ) {
    return true
  }
}

function FormatTimeframeDisplay({ timeframe }) {
  const fromDate = timeframe ? moment.unix(timeframe.fromDate) : null
  const toDate = timeframe ? moment.unix(timeframe.toDate) : null

  return (
    <>
      {fromDate && fromDate.format('MMM D, YYYY')}
      {toDate && ' - '}
      {toDate && toDate.format('MMM D, YYYY')}
      {!fromDate && !toDate && 'not set'}
    </>
  )
}

class ActivityHistory extends Component {
  constructor(props) {
    super(props)
    this.state = {
      timerId: 0,
    }
    this.differents = this.differents.bind(this)
    this.fetchChangingData = this.fetchChangingData.bind(this)
  }

  fetchChangingData() {
    this.props.fetchOutcomeHistory({
      address: this.props.outcomeHeaderHash,
    })
  }
  componentDidMount() {
    this.fetchChangingData()
    const id = setInterval(() => {
      this.fetchChangingData()
    }, 3000)
    this.setState({ timerId: id })
  }

  componentWillUnmount() {
    clearInterval(this.state.timerId)
  }

  differents(history) {
    let vector = []

    if (history && Object.keys(history).length > 0) {
      history.entries.map((entry, index) => {
        if (entry.timestampUpdated === null) {
          vector.push({
            user: entry.creatorAgentPubKey,
            time: entry.timestampCreated,
            comment: 'created this outcome',
          })
        } else {
          const previousOutcomeVersion = history.entries[index - 1]
          if (!previousOutcomeVersion) {
            return
          }
          // title/content
          if (previousOutcomeVersion.content !== entry.content) {
            vector.push({
              user: entry.userEditHash,
              time: entry.timestampUpdated,
              comment: `changed outcome title from "${previousOutcomeVersion.content}" to "${entry.content}" `,
              icon: 'font.svg',
            })
          }
          // hierarchy
          if (previousOutcomeVersion.hierarchy !== entry.hierarchy) {
            vector.push({
              user: entry.userEditHash,
              time: entry.timestampUpdated,
              comment: `changed hierachy from "${previousOutcomeVersion.hierarchy}" to "${entry.hierarchy}" `,
              hierarchyIcon: entry.hierarchy,
            })
          }
          // description
          if (previousOutcomeVersion.description !== entry.description) {
            vector.push({
              user: entry.userEditHash,
              time: entry.timestampUpdated,
              comment: `changed description from "${previousOutcomeVersion.description}" to "${entry.description}"`,
              icon: 'font.svg',
            })
          }
          // status
          if (previousOutcomeVersion.status !== entry.status) {
            vector.push({
              user: entry.userEditHash,
              time: entry.timestampUpdated,
              comment: `changed status from "${previousOutcomeVersion.status}" to "${entry.status}"`,
              statusIcon: entry.status,
            })
          }
          // tags
          if (previousOutcomeVersion.tags !== entry.tags) {
            vector.push({
              user: entry.userEditHash,
              time: entry.timestampUpdated,
              comment: 'changed the tags for ' + entry.tags,
            })
          }
          // timeframe added
          if (!previousOutcomeVersion.timeFrame && entry.timeFrame) {
            vector.push({
              user: entry.userEditHash,
              time: entry.timestampUpdated,
              comment: (
                <>
                  added the timeframe{' '}
                  {<FormatTimeframeDisplay timeframe={entry.timeFrame} />} to
                  this outcome
                </>
              ),
              icon: 'calendar.svg',
            })
          } else if (
            !checkTimeframeSame(
              previousOutcomeVersion.timeFrame,
              entry.timeFrame
            )
          ) {
            vector.push({
              user: entry.userEditHash,
              time: entry.timestampUpdated,
              comment: (
                <>
                  changed timeframe from{' '}
                  {
                    <FormatTimeframeDisplay
                      timeframe={previousOutcomeVersion.timeFrame}
                    />
                  }{' '}
                  to {<FormatTimeframeDisplay timeframe={entry.timeFrame} />}
                </>
              ),
              icon: 'calendar.svg',
            })
          }
        }
      })
      history.members.map((members) => {
        members.map((member, index) => {
          if (index === 0) {
            vector.push({
              user: member.userEditHash,
              time: member.unixTimestamp,
              comment: `added "${
                this.props.agents[member.agentAddress].firstName
              } ${
                this.props.agents[member.agentAddress].lastName
              }" as a squirrel`,
              icon: 'squirrel.svg',
            })
          }
          if (index === 1) {
            vector.push({
              user: member.userEditHash,
              time: member.unixTimestamp,
              comment: `removed "${
                this.props.agents[member.agentAddress].firstName
              } ${
                this.props.agents[member.agentAddress].lastName
              }" as a squirrel`,
            })
          }
        })
      })
    }

    return vector
  }
  render() {
    return (
      <div className="history">
        {this.differents(this.props.outcomeHistory)
          .sort((a, b) => {
            if (a.time < b.time) {
              return 1
            } else if (a.time > b.time) return -1
            else return 0
          })
          .map((value, index) => (
            <React.Fragment key={index}>
              <div className="history-Body-Container">
                {value.statusIcon && (
                  <StatusIcon
                    status={value.statusIcon}
                    className="status-icon-activity-history"
                    notHoverable
                    hideTooltip
                  />
                )}
                {!value.statusIcon && !value.hierarchyIcon && (
                  <Icon
                    name={value.icon}
                    size="small"
                    className="grey not-hoverable"
                  />
                )}
                {value.hierarchyIcon && (
                  <HierarchyIcon
                    hierarchy={value.hierarchyIcon}
                    size="small"
                    className="grey"
                  />
                )}
                <div className="history-Body-Avatar">
                  <Avatar
                    firstName={this.props.agents[value.user].firstName}
                    lastName={this.props.agents[value.user].lastName}
                    avatarUrl={this.props.agents[value.user].avatarUrl}
                    imported={this.props.agents[value.user].isImported}
                    small={true}
                  />
                </div>

                <div className="history-Body">
                  <div className="history-Header">
                    <span className="history-date">
                      {moment.unix(value.time).calendar(null, {
                        lastDay: '[Yesterday at] LT',
                        sameDay: '[Today at] LT',
                        nextDay: '[Tomorrow at] LT',
                        lastWeek: '[last] dddd [at] LT',
                        nextWeek: 'dddd [at] LT',
                        sameElse: 'MMM Do YYYY [at] LT',
                      })}
                    </span>
                  </div>
                  <div className="history-content">
                    <p className="history-info">
                      <span className="history-Author">
                        {this.props.agents[value.user].firstName +
                          ' ' +
                          this.props.agents[value.user].lastName}
                      </span>{' '}
                      {value.comment}
                    </p>
                  </div>
                </div>
              </div>
            </React.Fragment>
          ))}
      </div>
    )
  }
}
export default ActivityHistory