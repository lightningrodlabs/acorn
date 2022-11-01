import React, { useEffect } from 'react'
import './OutcomeConnectorPicker.scss'
import {
  Select,
  Option,
  useSingleSelect,
  useMultiSelect,
} from '../Select/Select'
import { calculateValidChildren } from '../../tree-logic'
import Modal, { ModalContent } from '../Modal/Modal'
import Typography from '../Typography/Typography'
import { ActionHashB64 } from '../../types/shared'

export default function OutcomeConnectorPicker({
  active,
  onClose,
  selectedOutcomes,
  connections,
  activeProject,
  saveConnections,
}) {
  // single select
  const [
    parentActionHash,
    toggleParent,
    resetParent,
  ] = useSingleSelect<ActionHashB64>()
  // multi select
  const [
    childrenAddresses,
    toggleChild,
    resetChildren,
  ] = useMultiSelect<ActionHashB64>()

  useEffect(() => {
    resetChildren()
  }, [parentActionHash])

  const validChildrenAddresses = parentActionHash
    ? calculateValidChildren(
        parentActionHash,
        connections,
        selectedOutcomes.map((g) => g.actionHash)
      )
    : []

  const save = async () => {
    if (!parentActionHash || !childrenAddresses.length) return
    try {
      await saveConnections(parentActionHash, childrenAddresses, activeProject)
      onClose()
    } catch (e) {
      console.log(e)
    }
  }

  const outcomeConnectorModalContent = (
    <div className="outcome-connector-content">
      <div className="outcome-connector-modal-subheading">
        <Typography style="body1">
          {' '}
          Choose a selected Outcome to become a Parent of the other selected
          Outcomes, if they don't already have a Parent yet.
        </Typography>
      </div>
      <div className="outcome-connector-dropdowns-wrapper">
        {/* Parent */}
        <div className="outcome-connector-dropdown-wrapper">
          <label htmlFor="parent">Parent</label>

          <Select
            hasSelection={!!parentActionHash}
            toggleSelectOption={toggleParent}
            toggleLabel={
              parentActionHash &&
              selectedOutcomes.find((s) => s.actionHash === parentActionHash)
                ? selectedOutcomes.find(
                    (s) => s.actionHash === parentActionHash
                  ).content
                : 'Choose the Parent Outcome'
            }
          >
            {selectedOutcomes.map((selectedOutcome) => (
              <Option
                key={selectedOutcome.actionHash}
                value={selectedOutcome.actionHash}
                label={selectedOutcome.content}
                selected={parentActionHash === selectedOutcome.actionHash}
              />
            ))}
          </Select>
        </div>
        {/* Children */}
        <div className="outcome-connector-dropdown-wrapper">
          <label htmlFor="children">Children</label>

          <Select
            hasSelection={childrenAddresses.length > 0}
            multiple
            toggleSelectOption={toggleChild}
            toggleLabel={`${childrenAddresses.length} Outcome${
              childrenAddresses.length === 1 ? '' : 's'
            } selected as Children`}
          >
            {selectedOutcomes
              .filter((g) => validChildrenAddresses.includes(g.actionHash))
              .map((selectedOutcome) => (
                <Option
                  key={selectedOutcome.actionHash}
                  value={selectedOutcome.actionHash}
                  label={selectedOutcome.content}
                  selected={childrenAddresses.includes(
                    selectedOutcome.actionHash
                  )}
                />
              ))}
          </Select>
        </div>
      </div>
    </div>
  )

  return (
    <Modal active={active} onClose={onClose} className="multi-edit-modal">
      <ModalContent
        heading="Connect Outcomes"
        content={outcomeConnectorModalContent}
        icon="hierarchy.svg"
        primaryButton="Save Changes"
        altButton="Cancel"
        primaryButtonAction={save}
        altButtonAction={onClose}
      />
    </Modal>
  )
}
