import React, { useState, useEffect } from 'react'

import './ProfileEditForm.scss'
import Button from '../Button/Button'
import ValidatingFormInput from '../ValidatingFormInput/ValidatingFormInput'
import Avatar from '../Avatar/Avatar'
import ButtonWithPendingState from '../ButtonWithPendingState/ButtonWithPendingState'
import Typography from '../Typography/Typography'
import { Profile } from 'zod-models'

// @ts-ignore
import AvatarPlaceholder from '../../images/avatar-placeholder.svg'

const urlRegex = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/

type ProfileEditFormProps = {
  pending: boolean
  pendingText: string
  onSubmit: (profile: Profile) => Promise<void>
  agentAddress: string
  myLocalProfile: Profile
  titleText: string
  subText: string
  submitText: string
}

const ProfileEditForm: React.FC<ProfileEditFormProps> = ({
  pending,
  pendingText,
  agentAddress,
  myLocalProfile,
  titleText,
  subText,
  submitText,
  onSubmit,
}) => {
  const [isValidFirstName, setisValidFirstName] = useState(true)
  const [isValidLastName, setIsValidLastName] = useState(true)
  const [isValidUserName, setIsValidUserName] = useState(true)
  const [errorUsername, setErrorUsername] = useState('')
  const [isValidAvatarUrl, setIsValidAvatarUrl] = useState(true)

  // internal state, tracking the form inputs
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [handle, setHandle] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')

  // call this to persist to holochain
  const innerOnSubmit = () => {
    if (
      isValidUserName &&
      isValidFirstName &&
      isValidLastName &&
      isValidAvatarUrl
    ) {
      onSubmit({
        firstName,
        lastName,
        avatarUrl,
        handle,
        status: 'Online',
        agentPubKey: agentAddress,
        isImported: false,
      })
    }
  }

  // validations
  useEffect(() => {
    // at least 1 character
    setisValidFirstName(firstName.length > 0)
  }, [firstName])
  useEffect(() => {
    // at least 1 character
    setIsValidLastName(lastName.length > 0)
  }, [lastName])
  useEffect(() => {
    // no whitespace, and no @ sign
    const isValid = /^[\S]+$/i.test(handle) && handle.indexOf('@') === -1
    setErrorUsername(
      isValid ? '' : 'Username is not valid. Avoid spaces and @.'
    )
    setIsValidUserName(isValid)
  }, [handle])
  useEffect(() => {
    // is a url
    setIsValidAvatarUrl(avatarUrl.length === 0 || urlRegex.test(avatarUrl))
  }, [avatarUrl])

  // initialize and update the internal state from the
  // persisted (holochain) state
  useEffect(() => {
    if (myLocalProfile) {
      setFirstName(myLocalProfile.firstName)
      setLastName(myLocalProfile.lastName)
      setHandle(myLocalProfile.handle)
      setAvatarUrl(myLocalProfile.avatarUrl)
    }
  }, [myLocalProfile])

  const usernameHelp =
    'Choose something easy for your teammates to use and recall. Avoid space and @.'
  const avatarShow = avatarUrl || AvatarPlaceholder

  const actionButton = (
    <ButtonWithPendingState
      pending={pending}
      pendingText={pendingText}
      actionText={submitText}
    />
  )

  return (
    <div className="profile_edit_form">
      <div className="profile_edit_form_title">
        <div className="profile-edit-form-title-wrapper">
          <Typography style="h2">{titleText}</Typography>
        </div>
        <div className="profile-edit-form-subtitle-wrapper">
          <Typography style="subtitle3">{subText}</Typography>
        </div>

        {/* <h4>{subText}</h4>
        <h4>{subText}</h4> */}
      </div>
      <form onSubmit={innerOnSubmit}>
        <div className="row">
          <ValidatingFormInput
            value={firstName}
            onChange={setFirstName}
            invalidInput={firstName.length > 0 && !isValidFirstName}
            validInput={firstName.length > 0 && isValidFirstName}
            errorText={
              firstName.length > 0 && !isValidFirstName
                ? 'First name is not valid.'
                : ''
            }
            label="First Name"
            placeholder="Katherine"
          />
          <div style={{ flex: 0.1 }} />
          <ValidatingFormInput
            value={lastName}
            onChange={setLastName}
            invalidInput={lastName.length > 0 && !isValidLastName}
            validInput={lastName.length > 0 && isValidLastName}
            errorText={
              lastName.length > 0 && !isValidLastName
                ? 'Last name is not valid.'
                : ''
            }
            label="Last Name"
            placeholder="Johnson"
          />
        </div>
        <div className="row">
          <ValidatingFormInput
            value={handle}
            onChange={setHandle}
            label="Username"
            helpText={usernameHelp}
            invalidInput={handle.length > 0 && !isValidUserName}
            validInput={handle.length > 0 && isValidUserName}
            errorText={
              handle.length > 0 && !isValidUserName ? errorUsername : ''
            }
            placeholder="katherinejohnson"
            withAtSymbol
          />
        </div>
        <div className="row">
          <ValidatingFormInput
            value={avatarUrl}
            onChange={setAvatarUrl}
            label="Profile Picture (optional)"
            placeholder="Paste in your profile picture URL here"
            invalidInput={avatarUrl.length > 0 && !isValidAvatarUrl}
            validInput={avatarUrl.length > 0 && isValidAvatarUrl}
            errorText={
              avatarUrl.length > 0 && !isValidAvatarUrl
                ? 'Invalid url. Make sure the url address is complete and valid.'
                : ''
            }
          />
          <div className="profile_edit_form_avatar">
            <Avatar avatarUrl={avatarShow} size="medium" />
          </div>
        </div>
        <div className="row">
          <ValidatingFormInput
            value={agentAddress}
            readOnly
            label="Your Public Key"
          />
        </div>
      </form>
      <Button
        disabled={
          !(
            isValidFirstName &&
            isValidLastName &&
            isValidUserName &&
            isValidAvatarUrl
          )
        }
        onClick={() => !pending && innerOnSubmit()}
        text={actionButton}
      />
    </div>
  )
}

export default ProfileEditForm
