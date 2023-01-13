import { CellId } from "@holochain/client"
import { getAdminWs, getAgentPubKey } from "../hcWebsockets"
import { PROJECT_APP_PREFIX } from "../holochainConfig"
import { passphraseToUid } from "../secrets"
import { CellIdString } from "../types/shared"
import { cellIdToString } from "../utils"

export async function installProjectApp(
    passphrase: string
  ): Promise<[CellIdString, CellId, string]> {
    const uid = passphraseToUid(passphrase)
    // add a bit of randomness so that
    // the same passphrase can be tried multiple different times
    // without conflicting
    // in order to eventually find their peers
    // note that this will leave a graveyard of deactivated apps for attempted
    // joins
    const installed_app_id = `${PROJECT_APP_PREFIX}-${Math.random()
      .toString()
      .slice(-6)}-${uid}`
    const adminWs = await getAdminWs()
    const agent_key = getAgentPubKey()
    if (!agent_key) {
      throw new Error(
        'Cannot install a new project because no AgentPubKey is known locally'
      )
    }
    // the dna hash HAS to act deterministically
    // in order for the 'joining' of Projects to work
    const happPath = window.require
      ? await window.require('electron').ipcRenderer.invoke('getProjectsPath')
      : './happ/workdir/projects/projects.happ'
    console.log(happPath)
    // INSTALL
    const installedApp = await adminWs.installApp({
      agent_key,
      installed_app_id,
      // what to do about the membrane_proof?
      membrane_proofs: {},
      path: happPath,
      network_seed: uid,
    })
    const cellInfo = Object.values(installedApp.cell_info)[0][0]
    const cellId = ('Provisioned' in cellInfo) ? cellInfo.Provisioned.cell_id : null
    const cellIdString = cellIdToString(cellId)
    await adminWs.enableApp({ installed_app_id })

    //authorize zome calls for the new cell
    await adminWs.authorizeSigningCredentials(cellId)
    return [cellIdString, cellId, installed_app_id]
  }