import React, { useState } from 'react'
import { useHistory } from 'react-router-dom'
import PropTypes from 'prop-types'

import './IntroScreen.scss'

import Button from '../Button/Button'
import Icon from '../Icon/Icon'

export default function IntroScreen() {
  const history = useHistory()

  const introScreensContents = [
    {
      image: 'img/intro-screen-image-1.svg',
      title: 'Welcome to Acorn',
      description:
        'Collaborate with your team to accomplish your complex project by visualizing and managing your dreams, outcomes, and tasks',
    },
    {
      image: 'img/intro-screen-image-2.svg',
      title: 'Help your team feel accomplished & aligned',
      description:
        "You and your team are able to see the complex project you're working on from multiple view modes and visually connect the small units of work that need to be done to the broader context of the greater outcomes. Everyone can see the progress being made, feel accomplished, and know clearly where they are headed.",
    },
    {
      image: 'img/intro-screen-image-3.svg',
      title: 'Make collaboration happen, peer-to-peer',
      description:
        'Help your distributed team to stay on track of changes and updates, communicate easily, avoid double-work, and help each other accomplish your outcomes. Acorn is even built on peer-to-peer technology called Holochain.',
    },
    {
      image: 'img/intro-screen-image-4.svg',
      title: 'None of us is as intelligent as all of us',
      description:
        'Completed an Outcome, now wondering what makes sense to focus on next? You and your team members can weigh in and vote on different metrics that inform the priority of outcomes to ease the challenge of decision making.',
    },
  ]

  const [screenContent, setScreenContent] = useState(0)

  const goBack = () => {
    if (screenContent !== 0) setScreenContent(screenContent - 1)
  }

  const goForward = () => {
    if (screenContent !== 3) setScreenContent(screenContent + 1)
  }

  const goToRegister = () => {
    // redirect
    history.push('/register')
  }

  return (
    <div className='intro-screen-wrapper'>
      <div className='skip-intro-button'>
        <div onClick={goToRegister}>Skip Intro</div>
      </div>
      <div className='intro-screen-content-frame'>
        {/* all 4 screens */}
        <div className={`content-wrapper active-screen-${screenContent}`}>
          {introScreensContents.map((screen, index) => {
            return (
              <div
                key={index}
                className={`screen screen-${index} ${index === screenContent ? 'active-screen' : ''
                  }`}>
                <div className='intro-screen-image'>

                  {/* <img src={screen.image} /> */}
                </div>
                <div className='intro-screen-text'>
                  <div className='intro-screen-title'>{screen.title}</div>
                  <div className='intro-screen-description'>
                    {screen.description}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        {/* forward and back buttons */}
        <div className='intro-screen-buttons'>
          {screenContent !== 0 && (
            <div className='button-back'>
              <Icon
                name='chevron-left.svg'
                className='light-grey'
                onClick={goBack}
                text={'back'}
              />
            </div>
          )}
          {screenContent !== 3 && (
            <div className='button-next'>
              <Icon
                name='chevron-right.svg'
                className='light-grey'
                onClick={goForward}
                text={'next'}
              />
            </div>
          )}
        </div>
        {/* dots for switching between screens */}
        <div className='screen-dots-wrapper'>
          {[0, 1, 2, 3].map(num => {
            return (
              <div key={num}>
                <div
                  onClick={() => setScreenContent(num)}
                  className={`screen-dot ${num === screenContent ? 'active-screen' : ''
                    }`}
                />
              </div>
            )
          })}
        </div>
        <div className='sign-up-button'>
          <Button onClick={goToRegister} text={'Sign me up'} />
        </div>
      </div>
    </div>
  )
}
