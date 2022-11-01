import React, { useEffect, useRef, useState } from 'react'
import { Redirect } from 'react-router-dom'
import ProfileEditForm from '../../components/ProfileEditForm/ProfileEditForm'
import { Profile } from '../../types'
import { AgentPubKeyB64, CellIdString } from '../../types/shared'
import './CreateProfilePage.scss'

export type CreateProfilePageProps = {
  hasProfile: boolean
  agentAddress: AgentPubKeyB64
  profilesCellIdString: CellIdString
  createWhoami: (
    profile: Profile,
    profilesCellIdString: CellIdString
  ) => Promise<void>
  fetchWhoami: (profilesCellIdString: CellIdString) => Promise<void>
}

const CreateProfilePage: React.FC<CreateProfilePageProps> = ({
  hasProfile,
  agentAddress,
  profilesCellIdString,
  createWhoami,
  fetchWhoami,
}) => {
  /*
    We do this so that if/when the agents Profile gossips to them,
    having been already imported by someone else,
    they don't stay here accidentally
  */
  const instance = useRef<NodeJS.Timeout>()
  useEffect(() => {
    instance.current = setInterval(() => {
      fetchWhoami(profilesCellIdString)
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
    await createWhoami(profile, profilesCellIdString)
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
