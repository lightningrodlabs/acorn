import React, { useEffect, useRef, useState } from 'react'
import { AppClient } from '@holochain/client'
import { Redirect } from 'react-router-dom'
import ProfileEditForm from '../../components/ProfileEditForm/ProfileEditForm'
import { Profile } from '../../types'
import { AgentPubKeyB64, CellIdString } from '../../types/shared'
import useAppWebsocket from '../../hooks/useAppWebsocket'
import './CreateProfilePage.scss'

export type CreateProfilePageOwnProps = {
  appWebsocket: AppClient
}

export type CreateProfilePageStateProps = {
  hasProfile: boolean
  agentAddress: AgentPubKeyB64
  profilesCellIdString: CellIdString
}

export type CreateProfilePageDispatchProps = {
  createWhoami: (
    appWebsocket: AppClient,
    profile: Profile,
    profilesCellIdString: CellIdString
  ) => Promise<void>
  fetchWhoami: (
    appWebsocket: AppClient,
    profilesCellIdString: CellIdString
  ) => Promise<void>
}

export type CreateProfilePageProps = CreateProfilePageOwnProps &
  CreateProfilePageStateProps &
  CreateProfilePageDispatchProps

const CreateProfilePage: React.FC<CreateProfilePageProps> = ({
  hasProfile,
  agentAddress,
  profilesCellIdString,
  createWhoami,
  fetchWhoami,
}) => {
  const appWebsocket = useAppWebsocket()
  /*
    We do this so that if/when the agents Profile gossips to them,
    having been already imported by someone else,
    they don't stay here accidentally
  */
  const instance = useRef<NodeJS.Timeout>()
  useEffect(() => {
    instance.current = setInterval(() => {
      fetchWhoami(appWebsocket, profilesCellIdString)
    }, 10000)
    return () => {
      clearInterval(instance.current)
    }
  }, [])

  const titleText = "First, let's set up your profile on Acorn."
  const subText = "You'll be able to edit them later in your Profile Settings."
  const pendingText = 'Setting you up...'
  const submitText = 'Ready to Start'
  const canClose = false
  const [pending, setPending] = useState(false)

  const innerOnSubmit = async (profile: Profile) => {
    setPending(true)
    await createWhoami(appWebsocket, profile, profilesCellIdString)
  }

  return hasProfile ? (
    <Redirect to="/" />
  ) : (
    <div className="create_profile_page">
      <div className="profile_create_wrapper">
        <ProfileEditForm
          onSubmit={innerOnSubmit}
          whoami={null}
          {...{
            canClose,
            titleText,
            subText,
            pending,
            pendingText,
            submitText,
            agentAddress,
          }}
        />
      </div>
      <div className="create_profile_splash_image" />
    </div>
  )
}

export default CreateProfilePage
