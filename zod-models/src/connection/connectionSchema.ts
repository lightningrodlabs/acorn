import { z } from 'zod'
import ConnectionV11Schema, { ConnectionV11 } from './v11/connectionV11Schema'
import ConnectionV12Schema, { ConnectionV12 } from './v12/connectionV12Schema'

export const ConnectionV11SchemaWithActionHash = z
  .object({ actionHash: z.string() })
  .merge(ConnectionV11Schema)

export const ConnectionV12SchemaWithActionHash = z
  .object({ actionHash: z.string() })
  .merge(ConnectionV12Schema)

export const BackwardsCompatibleConnectionSchema = z.union([
  ConnectionV11SchemaWithActionHash,
  ConnectionV12SchemaWithActionHash,
])

export type BackwardsCompatibleConnection = z.infer<
  typeof BackwardsCompatibleConnectionSchema
>

export {
  ConnectionV11Schema,
  ConnectionV12Schema,
  ConnectionV11,
  ConnectionV12,
}

// always update this to be whatever the current/latest one is
export const ConnectionSchema = ConnectionV12Schema
export type Connection = ConnectionV12

export const BackwardsCompatibleProjectConnectionsStateSchema = z.record(
  BackwardsCompatibleConnectionSchema
)

export type BackwardsCompatibleProjectConnectionsState = z.infer<
  typeof BackwardsCompatibleProjectConnectionsStateSchema
>

// this should always be updated to be whatever the current/latest one is
export const ProjectConnectionsStateSchema = z.record(
  ConnectionV12SchemaWithActionHash
)

export type ProjectConnectionsState = z.infer<
  typeof ProjectConnectionsStateSchema
>