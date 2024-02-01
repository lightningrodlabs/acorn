import React from 'react'
import { AppAgentClient } from '@holochain/client'

const AppWebsocketContext = React.createContext<AppAgentClient>(null)

export default AppWebsocketContext
