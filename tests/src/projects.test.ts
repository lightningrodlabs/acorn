import { assert, test } from 'vitest'
import { runScenario, dhtSync, type PlayerApp } from '@holochain-open-dev/tryorama'
import { decode } from '@msgpack/msgpack'
import {
  encodeHashToBase64,
  SignalType,
  type AppSignal,
  type CellId,
  type Signal,
} from '@holochain/client'

// Built by `yarn build:happ` (dev build: no wasm-opt, so not the canonical DNA).
const happPath = process.cwd() + '/../happs/happ/workdir/acorn.happ'
const appSource = { appBundleSource: { type: 'path' as const, value: happPath } }
const ZOME = 'projects'

// The `projects` role is `deferred: true`: no cell exists at install time and
// every project is a clone cell keyed by a network seed (installProject.ts).
async function joinProject(player: PlayerApp, networkSeed: string): Promise<CellId> {
  const cloned = await player.appWs.createCloneCell({
    role_name: 'projects',
    modifiers: { network_seed: networkSeed },
  })
  return cloned.cell_id
}

function call<T>(player: PlayerApp, cellId: CellId, fnName: string, payload: unknown) {
  return player.appWs.callZome<T>({
    cell_id: cellId,
    zome_name: ZOME,
    fn_name: fnName,
    payload,
  })
}

// Resolves with the first decoded app signal on `player` that matches.
function waitForSignal(
  player: PlayerApp,
  match: (payload: any) => boolean,
  timeoutMs = 30_000
): Promise<any> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`no matching signal within ${timeoutMs} ms`)),
      timeoutMs
    )
    const unsubscribe = player.appWs.on('signal', (signal: Signal) => {
      if (signal.type !== SignalType.App) return
      const payload: any = decode((signal.value as AppSignal).payload as Uint8Array)
      if (match(payload)) {
        clearTimeout(timer)
        unsubscribe()
        resolve(payload)
      }
    })
  })
}

test('two agents in one project: members, outcome create, remote signal, read back', async () => {
  await runScenario(async (scenario) => {
    const [alice, bob] = await scenario.addPlayersWithApps([appSource, appSource])

    const seed = `acorn-test-${Date.now()}`
    const aliceCell = await joinProject(alice, seed)
    const bobCell = await joinProject(bob, seed)
    const dnaHash = aliceCell[0]
    assert.equal(
      encodeHashToBase64(bobCell[0]),
      encodeHashToBase64(dnaHash),
      'same network seed gives the same project DNA'
    )
    await scenario.shareAllAgents()

    // First zome call on each cell runs `init`: the recv_remote_signal cap
    // grant (hdk_crud signals.rs) and the agent's Member entry.
    await call(alice, aliceCell, 'fetch_members', { input: null })
    await call(bob, bobCell, 'fetch_members', { input: null })
    await dhtSync([alice, bob], dnaHash)

    const aliceKey = encodeHashToBase64(alice.agentPubKey)
    const bobKey = encodeHashToBase64(bob.agentPubKey)
    const members: any[] = await call(alice, aliceCell, 'fetch_members', { input: null })
    assert.sameMembers(
      members.map((m) => m.entry.agentPubKey),
      [aliceKey, bobKey],
      'alice sees both members'
    )

    const outcome = {
      content: 'Ship Acorn on Holochain 0.7.1',
      creatorAgentPubKey: aliceKey,
      editorAgentPubKey: null,
      timestampCreated: 1760000000,
      timestampUpdated: null,
      scope: {
        Small: { achievementStatus: 'NotAchieved', targetDate: null, taskList: [] },
      },
      tags: [],
      description: 'two-agent runtime check',
      isImported: false,
      githubLink: '',
    }

    // create_outcome sends a remote signal to every member; Bob's conductor
    // accepts it only through his unrestricted recv_remote_signal grant.
    const bobSignal = waitForSignal(
      bob,
      (p) => p.signalType === 'Outcome' && p.data?.action === 'create'
    )
    const created: any = await call(alice, aliceCell, 'create_outcome', outcome)
    assert.deepEqual(created.entry, outcome)

    const signal = await bobSignal
    assert.equal(signal.data.data.actionHash, created.actionHash, 'bob got the create signal')
    assert.deepEqual(signal.data.data.entry, outcome)

    await dhtSync([alice, bob], dnaHash)

    const bobOutcomes: any[] = await call(bob, bobCell, 'fetch_outcomes', { input: 'All' })
    assert.equal(bobOutcomes.length, 1, 'bob sees exactly one outcome')
    assert.equal(bobOutcomes[0].actionHash, created.actionHash)
    assert.deepEqual(bobOutcomes[0].entry, outcome)
  })
})
