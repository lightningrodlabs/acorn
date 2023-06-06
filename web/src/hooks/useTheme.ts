import { useSelector } from 'react-redux'
import { RootState } from '../redux/reducer'

export default function useTheme() {
  return useSelector((state: RootState) => state.ui.localPreferences.color)
}
