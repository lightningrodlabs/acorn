import React from 'react'
import moment from 'moment'

export default function TimeframeFormat({ timeFrame }) {
    if (!timeFrame) timeFrame = {}
    let text = timeFrame.from_date
        ? String(moment.unix(timeFrame.from_date).format('MMM D, YYYY - '))
        : ''
    text += timeFrame.to_date
        ? String(moment.unix(timeFrame.to_date).format('MMM D, YYYY'))
        : ''
    return text
}