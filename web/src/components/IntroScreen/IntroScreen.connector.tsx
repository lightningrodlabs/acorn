import { connect } from 'react-redux'
import ProfilesZomeApi from '../../api/profilesApi'
import { whoami } from '../../redux/persistent/profiles/who-am-i/actions'
import { RootState } from '../../redux/reducer'
import { CellIdString } from '../../types/shared'
import { cellIdFromString } from '../../utils'
import IntroScreenInner, {
  IntroScreenDispatchProps,
  IntroScreenOwnProps,
  IntroScreenStateProps,
} from './IntroScreen.component'
import useAppWebsocket from '../../hooks/useAppWebsocket'
import React from 'react'

function mapStateToProps(state: RootState): IntroScreenStateProps {
  return {
    whoami: state.whoami,
    profilesCellId: state.cells.profiles,
  }
}

function mapDispatchToProps(
  dispatch: any,
  ownProps: IntroScreenOwnProps
): IntroScreenDispatchProps {
  const { appWebsocket } = ownProps
  return {
    fetchWhoami: async (profilesCellId: CellIdString) => {
      const cellId = cellIdFromString(profilesCellId)
      const profilesZomeApi = new ProfilesZomeApi(appWebsocket)
      const profile = await profilesZomeApi.profile.whoami(cellId)
      dispatch(whoami(profilesCellId, profile))
    },
  }
}

const IntroScreen = connect(
  mapStateToProps,
  mapDispatchToProps
)(IntroScreenInner)

// done this way because this is rendered directly by a route
const IntroScreenWrapper = () => {
  const appWebsocket = useAppWebsocket()
  return <IntroScreen appWebsocket={appWebsocket} />
}

export default IntroScreenWrapper
