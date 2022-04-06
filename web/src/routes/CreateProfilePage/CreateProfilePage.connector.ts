import { connect } from 'react-redux'
import { RootState } from '../../redux/reducer'
import { createWhoami } from '../../redux/persistent/profiles/who-am-i/actions'
import ProfilesZomeApi from '../../api/profilesApi'
import { getAppWs } from '../../hcWebsockets'
import { cellIdFromString } from '../../utils'
import CreateProfilePage from './CreateProfilePage.component'
import { Profile } from '../../types'

function mapStateToProps(state: RootState) {
  return {
    agentAddress: state.agentAddress,
    profileCellIdString: state.cells.profiles,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
  }
}

function mergeProps(stateProps, dispatchProps, _ownProps) {
  const { agentAddress, profileCellIdString } = stateProps
  const { dispatch } = dispatchProps
  return {
    agentAddress,
    createWhoami: async (profile: Profile) => {
      const appWebsocket = await getAppWs()
      const profilesZomeApi = new ProfilesZomeApi(appWebsocket)
      const cellId = cellIdFromString(profileCellIdString)
      const createdWhoami = await profilesZomeApi.profile.createWhoami(
        cellId,
        profile
      )
      return dispatch(createWhoami(profileCellIdString, createdWhoami))
    },
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(CreateProfilePage)
