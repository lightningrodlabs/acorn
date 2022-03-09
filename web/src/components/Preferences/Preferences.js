import React, { useState } from 'react'
import './Preferences.scss'

import Icon from '../Icon/Icon'
import Button from '../Button/Button'
import Modal from '../Modal/Modal'
import { MOUSE, TRACKPAD } from '../../redux/ephemeral/local-preferences/reducer'
import PreferenceSelect, {
  PreferenceSelectExtra,
  PreferenceSelectOption,
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
    </>
  )
}

function Internal({ navigation, setNavigationSelected, save }) {
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
}) {
  // hold an internal version of the preferences state, so that we can toggle it, before saving it
  const [navigationSelected, setNavigationSelected] = useState(navigation)

  const save = () => {
    setNavigationPreference(navigationSelected)
    setShowPreferences(false)
  }
  const close = () => {
    // reset navigation selected to
    // whatever the canonical state of navigation preference
    // is equal to
    setNavigationSelected(navigation)
    setShowPreferences(false)
  }

  return (
    <Modal white active={showPreferences} onClose={close}>
      <Internal
        navigation={navigationSelected}
        setNavigationSelected={setNavigationSelected}
        save={save}
      />
    </Modal>
  )
}
