import React from 'react'
import './OutcomeConnectors.scss'
import { ActionHashB64 } from '../../types/shared'
import {
  CoordinatesState,
  DimensionsState,
} from '../../redux/ephemeral/layout/state-type'
import SmartOutcomeConnector, {
  SmartOutcomeConnectorStateProps,
  SmartOutcomeConnectorDispatchProps,
} from '../SmartOutcomeConnector/SmartOutcomeConnector'

// extends SmartOutcomeConnector
export type OutcomeConnectorsStateProps = SmartOutcomeConnectorStateProps & {
  collapsedOutcomes: {
    [outcomeActionHash: string]: boolean
  }
  coordinates: CoordinatesState
  dimensions: DimensionsState
  existingParentConnectionAddress: ActionHashB64
  visibleOutcomesAddresses: ActionHashB64[]
}

// extends SmartOutcomeConnector
export type OutcomeConnectorsDispatchProps = SmartOutcomeConnectorDispatchProps

export type OutcomeConnectorsProps = OutcomeConnectorsDispatchProps &
  OutcomeConnectorsStateProps

const OutcomeConnectors: React.FC<OutcomeConnectorsProps> = ({
  allOutcomeActionHashes,
  activeProject,
  translate,
  zoomLevel,
  connections,
  coordinates,
  dimensions,
  outcomeConnectorMaybeLinkedOutcome,
  toAddress,
  existingParentConnectionAddress,
  visibleOutcomesAddresses,
  collapsedOutcomes,
  setOutcomeConnectorFrom,
  setOutcomeConnectorTo,
  dispatch,
}) => {
  return (
    <>
      {visibleOutcomesAddresses.map((visibleOutcomeAddress) => {
        const outcomeCoordinates = coordinates[visibleOutcomeAddress]
        const outcomeDimensions = dimensions[visibleOutcomeAddress]
        const isCollapsed = collapsedOutcomes[visibleOutcomeAddress]
        // look for an existing connection that defines a parent
        // of this Outcome, so that it can be deleted
        // if it is to be changed and a new one added
        // ONLY do this if there is only one parent
        const parents = connections.filter(
          (connection) => connection.childActionHash === visibleOutcomeAddress
        )
        const singularParent = parents.length === 1 ? parents[0] : undefined
        return (
          <div key={visibleOutcomeAddress}>
            {outcomeCoordinates && outcomeDimensions && (
              <SmartOutcomeConnector
                activeProject={activeProject}
                connections={connections}
                allOutcomeActionHashes={allOutcomeActionHashes}
                outcomeConnectorMaybeLinkedOutcome={
                  outcomeConnectorMaybeLinkedOutcome
                }
                toAddress={toAddress}
                ownExistingParentConnectionAddress={
                  singularParent && singularParent.actionHash
                }
                presetExistingParentConnectionAddress={
                  existingParentConnectionAddress
                }
                outcomeAddress={visibleOutcomeAddress}
                setOutcomeConnectorFrom={setOutcomeConnectorFrom}
                setOutcomeConnectorTo={setOutcomeConnectorTo}
                outcomeCoordinates={outcomeCoordinates}
                outcomeDimensions={outcomeDimensions}
                dispatch={dispatch}
                translate={translate}
                zoomLevel={zoomLevel}
                isCollapsed={isCollapsed}
              />
            )}
          </div>
        )
      })}
    </>
  )
}
export default OutcomeConnectors
