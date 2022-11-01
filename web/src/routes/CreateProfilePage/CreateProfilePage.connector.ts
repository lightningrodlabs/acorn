import { connect } from 'react-redux'
import { RootState } from '../../redux/reducer'
import {
  createWhoami,
  whoami,
} from '../../redux/persistent/profiles/who-am-i/actions'
import ProfilesZomeApi from '../../api/profilesApi'
import { getAppWs } from '../../hcWebsockets'
import { cellIdFromString } from '../../utils'
import CreateProfilePage, {
  CreateProfilePageProps,
} from './CreateProfilePage.component'
import { Profile } from '../../types'
import { CellIdString } from '../../types/shared'

function mapStateToProps(state: RootState) {
  return {
    agentAddress: state.agentAddress,
    hasProfile: !!state.whoami,
    profilesCellIdString: state.cells.profiles,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    fetchWhoami: async (profilesCellIdString: CellIdString) => {
      const cellId = cellIdFromString(profilesCellIdString)
      const client = await getAppWs()
      const profilesZomeApi = new ProfilesZomeApi(client)
      const profile = await profilesZomeApi.profile.whoami(cellId)
      return dispatch(whoami(profilesCellIdString, profile))
    },
    createWhoami: async (
      profile: Profile,
      profilesCellIdString: CellIdString
    ) => {
      const appWebsocket = await getAppWs()
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
