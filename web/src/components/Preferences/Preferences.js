import React, { useState } from 'react'
import './Preferences.css'

import Icon from '../Icon/Icon'
import Button from '../Button/Button'
import Modal from '../Modal/Modal'
import { MOUSE, TRACKPAD } from '../../local-preferences/reducer'

function Internal({ navigation, setNavigationSelected, save }) {
  return (
    <div className='preferences-content-wrapper'>
      <div className='preferences-title'>Preferences</div>
      <div className='preferences-section'>
        <div className='preferences-section-title-wrapper'>
          <Icon
            name='panning.svg'
            size='very-small'
            className='not-hoverable'
          />
          <div className='preferences-section-title'>Navigation Mode</div>
        </div>
        <div className='preferences-section-subtitle'>
          Select your preferred navigation mode on canvas based on your primary
          pointer device{' '}
        </div>
        <div className='navigation-mode-options-wrapper'>
          <div
            className={`navigation-mode-option ${
              navigation === TRACKPAD ? 'active' : ''
            }`}
            onClick={() => setNavigationSelected(TRACKPAD)}>
            <div className='navigation-mode-option-content'>
              <div className='navigation-mode-option-icon-trackpad'>
                <Icon
                  name='trackpad.svg'
                  size='large'
                  className='not-hoverable'
                />
              </div>
              <div className='navigation-mode-option-text'>Trackpad</div>
            </div>
          </div>
          <div
            className={`navigation-mode-option ${
              navigation === MOUSE ? 'active' : ''
            }`}
            onClick={() => setNavigationSelected(MOUSE)}>
            <div className='navigation-mode-option-content'>
              <div className='navigation-mode-option-icon-mouse'>
                <Icon name='mouse.svg' size='large' className='not-hoverable' />
              </div>
              <div className='navigation-mode-option-text'>Mouse</div>
            </div>
          </div>
        </div>
        <div className='navigation-mode-description-wrapper'>
          <div className='navigation-mode-description-title-wrapper'>
            <div className='navigation-mode-description-icon'>
              <Icon
                name='zooming.svg'
                size='very-small'
                className='not-hoverable'
              />
            </div>
            <div className='navigation-mode-description-title'>Zooming</div>
          </div>
          <div className='navigation-mode-description-text'>
            {navigation === TRACKPAD &&
              'Pinch in and out, or hold cmd/ctrl + scroll wheel'}
            {navigation === MOUSE &&
              'Use mouse wheel, or slide with two fingers up/down, or pinch in/out'}
          </div>
        </div>
        <div className='navigation-mode-description-wrapper'>
          <div className='navigation-mode-description-title-wrapper'>
            <div className='navigation-mode-description-icon'>
              <Icon
                name='panning.svg'
                size='very-small'
                className='not-hoverable'
              />
            </div>
            <div className='navigation-mode-description-title'>Panning</div>
          </div>
          <div className='navigation-mode-description-text'>
            {navigation === TRACKPAD &&
              'Slide on trackpad with two fingers, or click and drag with mouse'}
            {navigation === MOUSE && 'Click and drag the canvas'}
          </div>
        </div>
      </div>
      <div className='preferences-save-button'>
        <Button onClick={save} text='Save Changes' />
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
