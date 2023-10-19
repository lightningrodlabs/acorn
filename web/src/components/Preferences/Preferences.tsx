import React, { useState } from 'react'
import './Preferences.scss'

import Icon from '../Icon/Icon'
import Button from '../Button/Button'
import Modal from '../Modal/Modal'
import {
  COORDINATES,
  KeyboardNavigationPreference,
  MODAL,
  MOUSE,
  NavigationPreference,
  TRACKPAD,
} from '../../redux/ephemeral/local-preferences/reducer'
import PreferenceSelect, {
  PreferenceSelectExtra,
  PreferenceSelectOption,
} from '../PreferenceSelect/PreferenceSelect'
import { ModalState, OpenModal } from '../../context/ModalContexts'

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

function NavigationModeInternal({ navigation, setNavigationSelected }) {
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
      <PreferenceSelect
        iconName="panning.svg"
        title="Navigation Mode"
        subtitle="Select your preferred navigation mode on canvas based on your primary
          pointer device"
        // @ts-ignore
        options={options}
        // @ts-ignore
        descriptions={<Descriptions navigation={navigation} />}
      />
    </div>
  )
}

function KeyboardNavigationModeInternal({
  keyboardNavigation,
  setKeyboardNavigationSelected,
}) {
  const options = (
    <>
      <PreferenceSelectOption
        active={keyboardNavigation === MODAL}
        onClick={() => setKeyboardNavigationSelected(MODAL)}
        iconName="trackpad.svg"
        iconExtraClassName="navigation-mode-option-icon-trackpad"
        title="Use a Modal"
      />
      <PreferenceSelectOption
        active={keyboardNavigation === COORDINATES}
        onClick={() => setKeyboardNavigationSelected(COORDINATES)}
        iconName="mouse.svg"
        iconExtraClassName="navigation-mode-option-icon-mouse"
        title="Use Coordinates"
      />
    </>
  )
  return (
    <div className="preferences-content-wrapper">
      <PreferenceSelect
        iconName="panning.svg"
        title="Keyboard Navigation Mode"
        subtitle="Select your preferred method of using the keyboard to navigate from parent to child, and vice-versa"
        // @ts-ignore
        options={options}
      />
    </div>
  )
}

export type PreferencesProps = {
  navigationPreference: NavigationPreference
  setNavigationPreference: (preference: NavigationPreference) => void
  keyboardNavigationPreference: KeyboardNavigationPreference
  setKeyboardNavigationPreference: (
    preference: KeyboardNavigationPreference
  ) => void
  modalState: ModalState
  setModalState: React.Dispatch<React.SetStateAction<ModalState>>
}

export default function Preferences({
  navigationPreference,
  keyboardNavigationPreference,
  setNavigationPreference,
  setKeyboardNavigationPreference,
  modalState,
  setModalState,
}: PreferencesProps) {
  // hold an internal version of the preferences state, so that we can toggle it, before saving it
  const [navigationSelected, setNavigationSelected] = useState(navigationPreference)
  const [keyboardNavigationSelected, setKeyboardNavigationSelected] = useState(
    keyboardNavigationPreference
  )

  const save = () => {
    setNavigationPreference(navigationSelected)
    setKeyboardNavigationPreference(keyboardNavigationSelected)
    setModalState({ id: OpenModal.None })
  }
  const close = () => {
    // reset navigation selected to
    // whatever the canonical state of navigation preference
    // is equal to
    setNavigationSelected(navigationPreference)
    setKeyboardNavigationSelected(keyboardNavigationPreference)
    setModalState({ id: OpenModal.None })
  }

  return (
    <Modal
      white
      active={modalState.id === OpenModal.Preferences}
      onClose={close}
    >
      <div className="preferences-title">Preferences</div>
      <NavigationModeInternal
        navigation={navigationSelected}
        setNavigationSelected={setNavigationSelected}
      />
      <KeyboardNavigationModeInternal
        keyboardNavigation={keyboardNavigationSelected}
        setKeyboardNavigationSelected={setKeyboardNavigationSelected}
      />

      <div className="preferences-save-button">
        <Button onClick={save} text="Save Changes" />
      </div>
    </Modal>
  )
}
