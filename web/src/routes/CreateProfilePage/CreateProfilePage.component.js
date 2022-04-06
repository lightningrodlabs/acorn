import React, { useState } from 'react'
import { Redirect } from 'react-router-dom'
import ProfileEditForm from '../../components/ProfileEditForm/ProfileEditForm'
import './CreateProfilePage.scss'

export default function CreateProfilePage({ agentAddress, createWhoami }) {
  const titleText = "First, let's set up your profile on Acorn."
  const subText = "You'll be able to edit them later in your Profile Settings."
  const pendingText = 'Setting you up...'
  const submitText = 'Ready to Start'
  const canClose = false
  const [pending, setPending] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const innerOnSubmit = async profile => {
    setPending(true)
    await createWhoami(profile)
    setPending(false)
    setSubmitted(true)
  }

  return submitted ? (
    <Redirect to='/' />
  ) : (
    <div className='create_profile_page'>
      <div className='profile_create_wrapper'>
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
      <div className='create_profile_splash_image' />
    </div>
  )
}