import { connect } from 'react-redux'
import { RootState } from '../../redux/reducer'
import {
  createWhoami,
  whoami,
} from '../../redux/persistent/profiles/who-am-i/actions'
import ProfilesZomeApi from '../../api/profilesApi'
import { cellIdFromString } from '../../utils'
import CreateProfilePage, {
  CreateProfilePageDispatchProps,
  CreateProfilePageStateProps,
} from './CreateProfilePage.component'
import { Profile } from '../../types'
import { CellIdString } from '../../types/shared'
import { AppAgentClient } from '@holochain/client'

function mapStateToProps(state: RootState): CreateProfilePageStateProps {
  return {
    agentAddress: state.agentAddress,
    hasProfile: !!state.whoami,
    profilesCellIdString: state.cells.profiles,
  }
}

function mapDispatchToProps(dispatch: any): CreateProfilePageDispatchProps {
  return {
    fetchWhoami: async (
      appWebsocket: AppAgentClient,
      profilesCellIdString: CellIdString
    ) => {
      const cellId = cellIdFromString(profilesCellIdString)
      const profilesZomeApi = new ProfilesZomeApi(appWebsocket)
      const profile = await profilesZomeApi.profile.whoami(cellId)
      return dispatch(whoami(profilesCellIdString, profile))
    },
    createWhoami: async (
      appWebsocket: AppAgentClient,
      profile: Profile,
      profilesCellIdString: CellIdString
    ) => {
      const profilesZomeApi = new ProfilesZomeApi(appWebsocket)
      const cellId = cellIdFromString(profilesCellIdString)
      const createdWhoami = await profilesZomeApi.profile.createWhoami(
        cellId,
        profile
      )
      return dispatch(createWhoami(profilesCellIdString, createdWhoami))
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateProfilePage)
