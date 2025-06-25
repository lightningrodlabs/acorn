import React, { useState } from 'react'
import { Redirect } from 'react-router-dom'
import ProfileEditForm from '../../components/ProfileEditForm/ProfileEditForm'
import { Profile } from '../../types'
import { AgentPubKeyB64 } from '../../types/shared'
import './CreateProfilePage.scss'

export type CreateProfilePageStateProps = {
  hasProfile: boolean
  agentAddress: AgentPubKeyB64
}

export type CreateProfilePageDispatchProps = {
  createMyLocalProfile: (
    profile: Profile,
  ) => Promise<void>
}

export type CreateProfilePageProps = CreateProfilePageStateProps &
  CreateProfilePageDispatchProps

const CreateProfilePage: React.FC<CreateProfilePageProps> = ({
  hasProfile,
  agentAddress,
  createMyLocalProfile,
}) => {
  const titleText = "First, let's set up your profile for Acorn."
  const subText = "You'll be able to edit it later in your Profile Settings."
  const pendingText = 'Setting you up...'
  const submitText = 'Ready to Start'
  const canClose = false
  const [pending, setPending] = useState(false)

  const innerOnSubmit = async (profile: Profile) => {
    setPending(true)
    await createMyLocalProfile(profile)
  }

  return hasProfile ? (
    <Redirect to="/" />
  ) : (
    <div className="create_profile_page">
      <div className="profile_create_wrapper">
        <ProfileEditForm
          onSubmit={innerOnSubmit}
          myLocalProfile={null}
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
