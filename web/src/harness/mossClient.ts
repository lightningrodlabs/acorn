/**
 * MossHarnessClient — the Moss/Weave provider for the LLM harness.
 *
 * In Moss, the harness is meant to be a generalized affordance Moss provides to
 * ALL tools via the Weave host API (the same pattern as assets / notifications on
 * `WeaveServices`), NOT something each applet ships. As of @theweave/api 0.6.6
 * that affordance does not exist — `WeaveServices` has no agent/LLM member — so
 * this provider FEATURE-DETECTS it and reports unavailable until Moss ships it.
 *
 * When Moss adds it (expected shape: a `harness`/agent namespace on the weave
 * client), bind the HarnessClient methods to it here; nothing else in the app
 * needs to change.
 */
import {
  HarnessClient,
  HarnessInfo,
  HarnessPermissionDecision,
  HarnessPermissionRequest,
  HarnessSession,
} from './types'

export class MossHarnessClient implements HarnessClient {
  // The weave client (typed loosely): as of @theweave/api 0.6.6 it carries no
  // harness affordance, so we only feature-detect one here.
  private host: unknown

  constructor(weaveClient: unknown) {
    this.host = weaveClient
  }

  get available(): boolean {
    // Bind to the real affordance once Moss exposes it.
    return Boolean(this.host && (this.host as any).harness)
  }

  async initialize(): Promise<HarnessInfo> {
    throw new Error(
      'Moss does not yet provide an LLM harness affordance (Weave host API).'
    )
  }

  async newSession(): Promise<HarnessSession> {
    throw new Error(
      'Moss does not yet provide an LLM harness affordance (Weave host API).'
    )
  }

  onPermissionRequest(
    _handler: (
      req: HarnessPermissionRequest
    ) => Promise<HarnessPermissionDecision>
  ): void {
    // no-op until the Weave harness affordance exists
  }
}
