import { createZomeCallAsyncAction } from 'connoropolous-hc-redux-middleware'

export function sendEditSignal (zome_name, function_name) {
    const sendSignal = createZomeCallAsyncAction(zome_name, function_name)
    return sendSignal
}