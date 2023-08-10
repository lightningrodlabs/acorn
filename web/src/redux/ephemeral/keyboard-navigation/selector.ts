import { useSelector } from 'react-redux'
import { RootState } from '../../reducer'

export const useNavigationPreference = () => {
  const state = useSelector((state: RootState) => state)
  return state.ui.keyboardNavigationPreference.navigationPreference
}
