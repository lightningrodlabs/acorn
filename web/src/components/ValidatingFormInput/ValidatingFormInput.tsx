import React from 'react'
import PropTypes from 'prop-types'

import './ValidatingFormInput.scss'

import Typography from '../Typography/Typography'
// @ts-ignore
import ValidationCheck from '../../images/validation-check.svg'
// @ts-ignore
import ValidationX from '../../images/validation-x.svg'

type ValidatingFormInputProps = {
  value: string
  onChange?: (value: string) => void
  helpText?: string
  label: string
  placeholder?: string
  readOnly?: boolean
  withAtSymbol?: boolean
  errorText?: string
  invalidInput?: boolean
  validInput?: boolean
}

const ValidatingFormInput: React.FC<ValidatingFormInputProps> = ({
  withAtSymbol,
  readOnly,
  placeholder,
  label,
  value,
  helpText,
  errorText,
  invalidInput,
  validInput,
  onChange,
}) => {
  const innerOnChange = (e) => {
    e.preventDefault()
    onChange(e.target.value)
  }

  let inputClassName = withAtSymbol ? 'with-at-symbol' : ''
  if (invalidInput) {
    inputClassName += ' invalid-input'
  }
  if (validInput) {
    inputClassName += ' valid-input'
  }

  return (
    <div className="validating-form-input">
      <Typography style="label">
        <label htmlFor={label}>{label}</label>
      </Typography>

      {helpText && <p className="help-text">{helpText}</p>}
      <div className="input-wrapper">
        <input
          type="text"
          className={inputClassName}
          name={label}
          value={value}
          onChange={innerOnChange}
          placeholder={placeholder}
          readOnly={readOnly}
        />
        {errorText && <div className="error-text">{errorText}</div>}
        {withAtSymbol && <div className="at-symbol">@ </div>}
        {invalidInput && (
          <img src={ValidationX} className="validation-mark invalid" />
        )}
        {validInput && (
          <img src={ValidationCheck} className="validation-mark valid" />
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
  withAtSymbol: PropTypes.bool,
}

export default ValidatingFormInput
