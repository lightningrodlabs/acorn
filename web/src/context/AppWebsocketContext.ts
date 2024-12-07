import React from 'react'
import { AppClient } from '@holochain/client'

const AppWebsocketContext = React.createContext<AppClient>(null)

export default AppWebsocketContext
