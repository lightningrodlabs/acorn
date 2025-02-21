import React, { useState, useEffect, useRef } from 'react'
import { Redirect, useHistory } from 'react-router-dom'
import { AppClient } from '@holochain/client'

import Button from '../Button/Button'
import Icon from '../Icon/Icon'
import Typography from '../Typography/Typography'
import { Profile } from '../../types'
import { WireRecord } from '../../api/hdkCrud'
import { CellIdString } from '../../types/shared'

import './IntroScreen.scss'

export type IntroScreenStateProps = {
  whoami: WireRecord<Profile>
  profilesCellId: CellIdString
}
export type IntroScreenDispatchProps = {
  fetchWhoami: (profilesCellId: CellIdString) => Promise<void>
}
export type IntroScreenOwnProps = {
  appWebsocket?: AppClient
}
export type IntroScreenProps = IntroScreenOwnProps &
  IntroScreenStateProps &
  IntroScreenDispatchProps

const IntroScreen: React.FC<IntroScreenProps> = ({
  fetchWhoami,
  whoami,
  profilesCellId,
}) => {
  const history = useHistory()

  /*
    We do this so that if/when the agents Profile gossips to them,
    having been already imported by someone else,
    they don't stay here accidentally
  */
  const instance = useRef<NodeJS.Timeout>()
  useEffect(() => {
    instance.current = setInterval(() => fetchWhoami(profilesCellId), 10000)
    return () => {
      clearInterval(instance.current)
    }
  }, [])

  const introScreensContents = [
    {
      image: 'images/intro-vis-1.png',
      title: 'Truly peer-to-peer project management software',
      description:
        'Acorn is designed and built as a scrum-alternative, Agile Development Pattern for distributed software development teams. Powered by Holochain, it runs on decentralized peer-to-peer computing and can be used without server infrastructure or a hosting service.',
    },
    {
      image: 'images/intro-vis-2.png',
      title: 'Intended Outcomes, not goals',
      description:
        "In Acorn's ontology projects are managed through the lens of Intended Outcomes, their dependencies, Scope, and Achievement Status in a Plan-Do-Check-Act Cycle process. This helps you and your distributed team stay on track while working on a complex project.",
    },
    {
      image: 'images/intro-vis-3.png',
      title: 'More intelligent project management',
      description:
        'Acorn provides the sweet-spot combination of annotated and computed metadata to help you and your team make sense of the complexity of your project, make measurable estimations of Outcome achievement durations, and to see the progress status of the project as a whole.',
    },
    {
      image: 'images/intro-vis-4.png',
      title: 'Multiple lenses for your project',
      description:
        'Each project view in Acorn helps you and your team members when you have a different kind of focus. There is Map View to offer a high-level overview, Table View which is task-oriented, and Priority View for aligning your team.',
    },
  ]

  const [screenContent, setScreenContent] = useState(0)

  const goBack = () => {
    if (screenContent !== 0) setScreenContent(screenContent - 1)
  }

  const goForward = () => {
    if (screenContent !== 3) setScreenContent(screenContent + 1)
  }

  // navigating intro screens with keyboard arrow keys
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'ArrowRight') {
        goForward()
      } else if (event.key === 'ArrowLeft') {
        goBack()
      }
    }
    document.body.addEventListener('keydown', onKeyDown)
    // for teardown, unbind event listeners
    return () => {
      document.body.removeEventListener('keydown', onKeyDown)
    }
  }, [screenContent])

  const goToRegister = () => {
    // redirect
    history.push('/register')
  }

  return (
    <>
      {/*
        We do this so that if/when the agents Profile gossips to them,
        having been already imported by someone else,
        they don't stay here accidentally
      */}
      {whoami && <Redirect to="/" />}
      <div className="intro-screen-wrapper">
        {/* <div className="skip-intro-button">
          <div onClick={goToRegister}>Skip Intro</div>
        </div> */}
        <div className="intro-screen-content-frame">
          {/* all 4 screens */}
          <div className={`content-wrapper active-screen-${screenContent}`}>
            {introScreensContents.map((screen, index) => {
              return (
                <div
                  key={index}
                  className={`screen screen-${index} ${
                    index === screenContent ? 'active-screen' : ''
                  }`}
                >
                  {/* Intro Screen Text */}
                  <div className="intro-screen-text">
                    <Typography style="h1">{screen.title}</Typography>
                    <Typography style="body1">{screen.description}</Typography>
                  </div>

                  {/* Intro Screen Image */}
                  <div className="intro-screen-image">
                    <img src={screen.image} />
                  </div>
                </div>
              )
            })}
          </div>
          {/* forward and back buttons */}
          <div className="intro-screen-buttons">
            {screenContent !== 0 && (
              <div className="button-back">
                <Icon
                  name="chevron-left.svg"
                  className="light-grey"
                  onClick={goBack}
                  tooltipText={'back'}
                />
              </div>
            )}
            {screenContent !== 3 && (
              <div className="button-next">
                <Icon
                  name="chevron-right.svg"
                  className="light-grey"
                  onClick={goForward}
                  tooltipText={'next'}
                />
              </div>
            )}
          </div>
          {/* dots for switching between screens */}
          <div className="screen-dots-wrapper">
            {[0, 1, 2, 3].map((num) => {
              return (
                <div key={num}>
                  <div
                    onClick={() => setScreenContent(num)}
                    className={`screen-dot ${
                      num === screenContent ? 'active-screen' : ''
                    }`}
                  />
                </div>
              )
            })}
          </div>
          <div className="sign-up-button">
            <Button onClick={goToRegister} text={'Get started'} />
          </div>
        </div>
      </div>
    </>
  )
}

export default IntroScreen
