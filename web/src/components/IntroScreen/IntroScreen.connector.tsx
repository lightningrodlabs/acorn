import { connect } from 'react-redux'
import ProfilesZomeApi from '../../api/profilesApi'
import { getAppWs } from '../../hcWebsockets'
import { whoami } from '../../redux/persistent/profiles/who-am-i/actions'
import { RootState } from '../../redux/reducer'
import { CellIdString } from '../../types/shared'
import { cellIdFromString } from '../../utils'
import IntroScreen, {
  DispatchIntroScreenProps,
  StateIntroScreenProps,
} from './IntroScreen.component'

function mapStateToProps(state: RootState): StateIntroScreenProps {
  return {
    whoami: state.whoami,
    profilesCellId: state.cells.profiles,
  }
}

function mapDispatchToProps(dispatch): DispatchIntroScreenProps {
  return {
    fetchWhoami: async (profilesCellId: CellIdString) => {
      const cellId = cellIdFromString(profilesCellId)
      const client = await getAppWs()
      const profilesZomeApi = new ProfilesZomeApi(client)
      const profile = await profilesZomeApi.profile.whoami(cellId)
      dispatch(whoami(profilesCellId, profile))
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(IntroScreen)
