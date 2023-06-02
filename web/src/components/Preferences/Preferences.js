import React, { useState } from 'react'
import './Preferences.scss'

import Icon from '../Icon/Icon'
import Button from '../Button/Button'
import Modal from '../Modal/Modal'
import { MOUSE, TRACKPAD, LIGHT, DARK } from '../../redux/ephemeral/local-preferences/reducer'
import PreferenceSelect, {
  PreferenceSelectExtra,
  PreferenceSelectOption,
  PreferenceSelectOptionColor,
} from '../PreferenceSelect/PreferenceSelect'

function Descriptions({ navigation }) {
  return (
    <>
      <PreferenceSelectExtra>
        <div className="navigation-mode-description-title-wrapper">
          <div className="navigation-mode-description-icon">
            <Icon
              name="zoom-in.svg"
              size="very-small"
              className="not-hoverable"
            />
          </div>
          <div className="navigation-mode-description-title">Zooming</div>
        </div>
        <div className="navigation-mode-description-text">
          {navigation === TRACKPAD &&
            'Pinch in and out, or hold cmd/ctrl + scroll wheel'}
          {navigation === MOUSE &&
            'Use mouse wheel, or slide with two fingers up/down, or pinch in/out'}
        </div>
      </PreferenceSelectExtra>
      <PreferenceSelectExtra>
        <div className="navigation-mode-description-title-wrapper">
          <div className="navigation-mode-description-icon">
            <Icon
              name="navigation.svg"
              size="very-small"
              className="not-hoverable"
            />
          </div>
          <div className="navigation-mode-description-title">Panning</div>
        </div>
        <div className="navigation-mode-description-text">
          {navigation === TRACKPAD &&
            'Slide on trackpad with two fingers, or click and drag with mouse'}
          {navigation === MOUSE && 'Click and drag the canvas'}
        </div>
      </PreferenceSelectExtra>
      <PreferenceSelectExtra>
        <div className='color-mode-description-title-wrapper'>

        </div>
      </PreferenceSelectExtra>
    </>
  )
}

function Internal({ navigation, setNavigationSelected, color, setColorSelected, save }) {
  const options = (
    <>
      <PreferenceSelectOption
        active={navigation === TRACKPAD}
        onClick={() => setNavigationSelected(TRACKPAD)}
        iconName="trackpad.svg"
        iconExtraClassName="navigation-mode-option-icon-trackpad"
        title="Trackpad"
      />
      <PreferenceSelectOption
        active={navigation === MOUSE}
        onClick={() => setNavigationSelected(MOUSE)}
        iconName="mouse.svg"
        iconExtraClassName="navigation-mode-option-icon-mouse"
        title="Mouse"
      />
    </>
  )
  const colorOptions = (
    <>
      <PreferenceSelectOptionColor
        active={color === LIGHT}
        onClick={() => setColorSelected(LIGHT)}
        iconName="acorn-logo.svg"
        iconExtraClassName="color-mode-option-icon-light"
        title="Light"
      />
      <PreferenceSelectOptionColor
        active={color === DARK}
        onClick={() => setColorSelected(DARK)}
        iconName="acorn-logo-light.svg"
        iconExtraClassName="color-mode-option-icon-dark"
        title="Dark"
      />
    </>
  )
  return (
    <div className="preferences-content-wrapper">
      <div className="preferences-title">Preferences</div>
      <PreferenceSelect
        iconName="panning.svg"
        title="Navigation Mode"
        subtitle="Select your preferred navigation mode on canvas based on your primary
          pointer device"
        options={options}
        descriptions={<Descriptions navigation={navigation} />}
      />
      <PreferenceSelect
        iconName="acorn-logo.svg"
        title="Light Mode"
        subtitle="Select your perferred color scheme"
        options={colorOptions}
      />
      <div className="preferences-save-button">
        <Button onClick={save} text="Save Changes" />
      </div>
    </div>
  )
}

export default function Preferences({
  navigation,
  setNavigationPreference,
  showPreferences,
  setShowPreferences,
  color,
  setColorPreference,
}) {
  // hold an internal version of the preferences state, so that we can toggle it, before saving it
  const [navigationSelected, setNavigationSelected] = useState(navigation)
  const [colorSelected, setColorSelected] = useState(color)

  const save = () => {
    setNavigationPreference(navigationSelected)
    setColorPreference(colorSelected)
    setShowPreferences(false)
  }
  const close = () => {
    // reset navigation selected to
    // whatever the canonical state of navigation preference
    // is equal to
    setNavigationSelected(navigation)
    setColorSelected(color)
    setShowPreferences(false)
  }

  return (
    <Modal white active={showPreferences} onClose={close}>
      <Internal
        navigation={navigationSelected}
        setNavigationSelected={setNavigationSelected}
        color={colorSelected}
        setColorSelected={setColorSelected}
        save={save}
      />
    </Modal>
  )
}
