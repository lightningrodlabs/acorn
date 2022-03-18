import React, { useState } from 'react'
import { Redirect } from 'react-router-dom'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { createWhoami } from '../../redux/persistent/profiles/who-am-i/actions'
import ProfileEditForm from '../../components/ProfileEditForm/ProfileEditForm'
import './CreateProfilePage.scss'
import ProfilesZomeApi from '../../api/profilesApi'
import { getAppWs } from '../../hcWebsockets'

function CreateProfilePage({ agentAddress, createWhoami }) {
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

CreateProfilePage.propTypes = {
  agentAddress: PropTypes.string,
  createWhoami: PropTypes.func,
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
  }
}

function mapStateToProps(state) {
  return {
    agentAddress: state.agentAddress,
    profileCellIdString: state.cells.profiles,
  }
}

function mergeProps(stateProps, dispatchProps, _ownProps) {
  const { agentAddress, profileCellIdString } = stateProps
  // TODO: convert to buffer
  const { dispatch } = dispatchProps
  const appWebsocket = await getAppWs()
  const profilesZomeApi = new ProfilesZomeApi(appWebsocket)
  return {
    agentAddress,
    createWhoami: profile => {
      const createdWhoami = profilesZomeApi.profile.createWhoami(cellId, profile)
      return dispatch(
        createWhoami(profileCellIdString, createdWhoami)
      )
    },
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(CreateProfilePage)
