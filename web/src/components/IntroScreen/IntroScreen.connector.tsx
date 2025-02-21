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
import { getAppWs, getWeaveProfilesClient } from '../../hcWebsockets'
import { isWeaveContext } from '@theweave/api'

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
  return {
    fetchWhoami: async (profilesCellId: CellIdString) => {
      const appWebsocket = await getAppWs()
      const cellId = cellIdFromString(profilesCellId)
      const profilesZomeApi = await (async () => {
        if (isWeaveContext()) {
          const profilesClient = await getWeaveProfilesClient()
          return new ProfilesZomeApi(appWebsocket, profilesClient)
        } else return new ProfilesZomeApi(appWebsocket)
      })()
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
