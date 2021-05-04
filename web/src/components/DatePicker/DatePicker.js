import React, { useState, useEffect } from 'react'
import moment from 'moment'

import PickerTemplate from '../PickerTemplate/PickerTemplate'
import 'react-dates'
import { DateRangePicker } from 'react-dates'
import { START_DATE } from 'react-dates/constants'
import 'react-dates/lib/css/_datepicker.css'
import 'react-dates/initialize'

import './DatePicker.css'

function DatePicker({ fromDate, toDate, onClose, onSet }) {
  const [dates, setDates] = useState({
    fromDate,
    toDate,
  })
  const [focusedInput, setFocusedInput] = useState(START_DATE)

  useEffect(() => {
    onSet(
      dates.fromDate ? dates.fromDate.unix() : null,
      dates.toDate ? dates.toDate.unix() : null
    )
  }, [dates])

  return (
    <PickerTemplate
      heading='timeframe'
      className='date_picker_wrapper'
      onClose={onClose}>
      <div className='date_picker_content'>
        <DateRangePicker
          numberOfMonths={1}
          minimumNights={0}
          onClose={() => {}}
          showClearDates
          keepOpenOnDateSelect
          customCloseIcon={<button className='clear-button'>clear all</button>}
          startDate={dates.fromDate} // momentPropTypes.momentObj or null,
          startDateId='your_unique_start_date_id'
          endDate={dates.toDate} // momentPropTypes.momentObj or null,
          endDateId='your_unique_end_date_id'
          onDatesChange={({ startDate, endDate }) =>
            setDates({ fromDate: startDate, toDate: endDate })
          }
          focusedInput={focusedInput}
          onFocusChange={focusedInput => {
            // doesn't update the focusedInput if it is trying to close the DRP
            if (!focusedInput) return
            setFocusedInput(focusedInput)
          }}
        />
      </div>
    </PickerTemplate>
  )
}

export default DatePicker
