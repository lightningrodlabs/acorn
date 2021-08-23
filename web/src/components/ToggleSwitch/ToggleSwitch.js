import React from 'react'
import Switch from '@material-ui/core/Switch'
import makeStyles from '@material-ui/styles/makeStyles'
import ToggleSwitchStyles from './ToggleSwitchStyles'

const useToggleSwitchStyles = makeStyles(ToggleSwitchStyles, {
    name: 'AcornToggleSwitch',
})

function ToggleSwitch({
    checked,
    onChange
}) {
    const ToggleSwitchStyles = useToggleSwitchStyles()
    return <Switch classes={ToggleSwitchStyles} color="primary" checked={checked} onChange={onChange} />
}

export default ToggleSwitch