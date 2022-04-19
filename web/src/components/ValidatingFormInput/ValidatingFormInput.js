import React from 'react'
import PropTypes from 'prop-types'


import './ValidatingFormInput.scss'

import ValidationCheck from '../../imagescircle-check.svg'
import ValidationX from '../../images/circle-x.svg'

function ValidatingFormInput({
  withAtSymbol,
  readOnly,
  placeholder,
  label,
  value,
  onChange,
  helpText,
  errorText,
  invalidInput,
  validInput,
  defaultInput
}) {
  const innerOnChange = e => {
    e.preventDefault()
    onChange(e.target.value)
  }

  let inputClassName = withAtSymbol ? 'with_at_symbol' : ''
  if (invalidInput) {
    inputClassName += ' invalid-input'
  }
  if (validInput) {
    inputClassName += ' valid-input'
  }
  if (defaultInput) {
    inputClassName += ''
  }

  return (
    <div className='validating_form_input'>
      <label htmlFor={label}>{label}</label>
      {helpText && <p className='help_text'>{helpText}</p>}
      <div className='input_wrapper'>
        <input
          type='text'
          className={inputClassName}
          name={label}
          value={value}
          onChange={innerOnChange}
          placeholder={placeholder}
          readOnly={readOnly}
        />
        {errorText && <div className='error_text'>{errorText}</div>}
        {withAtSymbol && <div className='at_symbol'>@ </div>}
        {invalidInput && (
          <img src={ValidationX} className='validation-mark' />
        )}
        {validInput && (
          <img src={ValidationCheck} className='validation-mark' />
        )}
      </div>
    </div>
  )
}

ValidatingFormInput.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  helpText: PropTypes.string,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  readOnly: PropTypes.bool,
  withAtSymbol: PropTypes.bool
}

export default ValidatingFormInput
