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
import { AppClient } from '@holochain/client'
import { isWeContext } from '@lightningrodlabs/we-applet'
import { getWeaveProfilesClient } from '../../hcWebsockets'

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
      appWebsocket: AppClient,
      profilesCellIdString: CellIdString
    ) => {
      const cellId = cellIdFromString(profilesCellIdString)
      const profilesZomeApi = await (async () => {
        if (isWeContext()) {
          const profilesClient = await getWeaveProfilesClient()
          return new ProfilesZomeApi(appWebsocket, profilesClient)
        } else return new ProfilesZomeApi(appWebsocket)
      })()
      const profile = await profilesZomeApi.profile.whoami(cellId)
      return dispatch(whoami(profilesCellIdString, profile))
    },
    createWhoami: async (
      appWebsocket: AppClient,
      profile: Profile,
      profilesCellIdString: CellIdString
    ) => {
      const profilesZomeApi = await (async () => {
        if (isWeContext()) {
          const profilesClient = await getWeaveProfilesClient()
          return new ProfilesZomeApi(appWebsocket, profilesClient)
        } else return new ProfilesZomeApi(appWebsocket)
      })()
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
