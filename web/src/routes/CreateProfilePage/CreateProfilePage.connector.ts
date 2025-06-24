import { connect } from 'react-redux'
import { RootState } from '../../redux/reducer'
import { writeMyLocalProfile } from '../../utils'
import CreateProfilePage, {
  CreateProfilePageDispatchProps,
  CreateProfilePageStateProps,
} from './CreateProfilePage.component'
import { Profile } from '../../types'
import { isWeaveContext } from '@theweave/api'
import { setMyLocalProfile } from '../../redux/persistent/profiles/my-local-profile/actions'

function mapStateToProps(state: RootState): CreateProfilePageStateProps {
  return {
    agentAddress: state.agentAddress,
    hasProfile: !!state.myLocalProfile,
  }
}

function mapDispatchToProps(dispatch: any): CreateProfilePageDispatchProps {
  return {
    createMyLocalProfile: (
      profile: Profile
    ) => {
      if (isWeaveContext()) {
        throw new Error("Cannot create profile in Moss. Needs to be read from WeaveClient.")
      }
      writeMyLocalProfile(profile);
      return dispatch(setMyLocalProfile(profile))
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateProfilePage)
