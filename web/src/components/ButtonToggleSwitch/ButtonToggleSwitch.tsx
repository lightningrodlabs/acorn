import React from 'react'

import './ButtonToggleSwitch.scss'

export type ButtonToggleSwitchProps = {
  size: 'small' | 'medium' | 'large'
  switchState: boolean
  onSwitchState: (newState: boolean) => void
  state1: { icon: React.Component; text: string }
  state2: { icon: React.Component; text: string }
}

const ButtonToggleSwitch: React.FC<ButtonToggleSwitchProps> = ({
  size = 'medium',
  switchState,
  onSwitchState,
  state1,
  state2,
}) => {
  return (
    <div className="button-toggle-switch-wrapper">
      {/* {switchState.toString()} */}
      {/* cative state background border */}
      <div className="button-toggle-switch-inner-wrapper">
      <div
        className={`selected-state-bg ${switchState ? 'state2' : 'state1'}`}
      ></div>
      {/* State 1 */}
      <div
        className={`button-toggle-switch-state ${
          switchState ? '' : 'selected'
        } `}
        onClick={() => onSwitchState(false)}
      >
        <div>{state1.icon}</div>
        <div>{state1.text}</div>
      </div>
      {/* State 2 */}
      <div
        className={`button-toggle-switch-state ${
          switchState ? 'selected' : ''
        } `}
        onClick={() => onSwitchState(true)}
      >
        <div>{state2.icon}</div>
        <div>{state2.text}</div>
      </div>
      </div>
    </div>
  )
}

export default ButtonToggleSwitch
