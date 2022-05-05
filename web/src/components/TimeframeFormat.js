import React from 'react'
import moment from 'moment'

export default function TimeframeFormat({ timeFrame }) {
  if (!timeFrame) timeFrame = {}
  let text = timeFrame.fromDate
    ? String(moment.unix(timeFrame.fromDate).format('MMM D, YYYY - '))
    : ''
  text += timeFrame.toDate
    ? String(moment.unix(timeFrame.toDate).format('MMM D, YYYY'))
    : ''
  return <>text</>
}
