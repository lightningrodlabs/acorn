import { AppAgentClient, CellId } from '@holochain/client'

export default async function callZome<InputType, OutputType>(
  appWebsocket: AppAgentClient,
  cellId: CellId,
  zomeName: string,
  fnName: string,
  payload: InputType
): Promise<OutputType> {
  const provenance = cellId[1]
  return appWebsocket.callZome({
    cell_id: cellId,
    zome_name: zomeName,
    fn_name: fnName,
    payload: payload,
    cap_secret: null,
    provenance,
  })
}
