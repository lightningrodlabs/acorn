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
    oldTimeframe.from_date === newTimeframe.from_date &&
    oldTimeframe.to_date === newTimeframe.to_date
  ) {
    return true
  }
}

function FormatTimeframeDisplay({ timeframe }) {
  const fromDate = timeframe ? moment.unix(timeframe.from_date) : null
  const toDate = timeframe ? moment.unix(timeframe.to_date) : null

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
      address: this.props.outcomeAddress,
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
        if (entry.timestamp_updated === null) {
          vector.push({
            user: entry.user_hash,
            time: entry.timestamp_created,
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
              user: entry.user_edit_hash,
              time: entry.timestamp_updated,
              comment: `changed outcome title from "${previousOutcomeVersion.content}" to "${entry.content}" `,
              icon: 'font.svg',
            })
          }
          // hierarchy
          if (previousOutcomeVersion.hierarchy !== entry.hierarchy) {
            vector.push({
              user: entry.user_edit_hash,
              time: entry.timestamp_updated,
              comment: `changed hierachy from "${previousOutcomeVersion.hierarchy}" to "${entry.hierarchy}" `,
              hierarchyIcon: entry.hierarchy,
            })
          }
          // description
          if (previousOutcomeVersion.description !== entry.description) {
            vector.push({
              user: entry.user_edit_hash,
              time: entry.timestamp_updated,
              comment: `changed description from "${previousOutcomeVersion.description}" to "${entry.description}"`,
              icon: 'font.svg',
            })
          }
          // status
          if (previousOutcomeVersion.status !== entry.status) {
            vector.push({
              user: entry.user_edit_hash,
              time: entry.timestamp_updated,
              comment: `changed status from "${previousOutcomeVersion.status}" to "${entry.status}"`,
              statusIcon: entry.status,
            })
          }
          // tags
          if (previousOutcomeVersion.tags !== entry.tags) {
            vector.push({
              user: entry.user_edit_hash,
              time: entry.timestamp_updated,
              comment: 'changed the tags for ' + entry.tags,
            })
          }
          // timeframe added
          if (!previousOutcomeVersion.time_frame && entry.time_frame) {
            vector.push({
              user: entry.user_edit_hash,
              time: entry.timestamp_updated,
              comment: (
                <>
                  added the timeframe{' '}
                  {<FormatTimeframeDisplay timeframe={entry.time_frame} />} to
                  this outcome
                </>
              ),
              icon: 'calendar.svg',
            })
          } else if (
            !checkTimeframeSame(
              previousOutcomeVersion.time_frame,
              entry.time_frame
            )
          ) {
            vector.push({
              user: entry.user_edit_hash,
              time: entry.timestamp_updated,
              comment: (
                <>
                  changed timeframe from{' '}
                  {
                    <FormatTimeframeDisplay
                      timeframe={previousOutcomeVersion.time_frame}
                    />
                  }{' '}
                  to {<FormatTimeframeDisplay timeframe={entry.time_frame} />}
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
              user: member.user_edit_hash,
              time: member.unix_timestamp,
              comment: `added "${
                this.props.agents[member.agent_address].first_name
              } ${
                this.props.agents[member.agent_address].last_name
              }" as a squirrel`,
              icon: 'squirrel.svg',
            })
          }
          if (index === 1) {
            vector.push({
              user: member.user_edit_hash,
              time: member.unix_timestamp,
              comment: `removed "${
                this.props.agents[member.agent_address].first_name
              } ${
                this.props.agents[member.agent_address].last_name
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
                    first_name={this.props.agents[value.user].first_name}
                    last_name={this.props.agents[value.user].last_name}
                    avatar_url={this.props.agents[value.user].avatar_url}
                    imported={this.props.agents[value.user].is_imported}
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
                        {this.props.agents[value.user].first_name +
                          ' ' +
                          this.props.agents[value.user].last_name}
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