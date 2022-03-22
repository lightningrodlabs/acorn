import React, { useEffect } from 'react'
import { CSSTransition } from 'react-transition-group'
import './ConnectionConnectorPicker.scss'
import PickerTemplate from '../PickerTemplate/PickerTemplate'
import { Select, Option, useSelect } from '../Select/Select'
import { calculateValidChildren } from '../ConnectionConnectors/ConnectionConnectors.component'
import Button from '../Button/Button'

export default function ConnectionConnectorPicker({
  onClose,
  selectedOutcomes,
  connections,
  activeProject,
  previewConnections,
  saveConnections,
  clearPreview,
}) {
  const isOpen = true

  // single select
  const [parentAddress, toggleParent, resetParent] = useSelect()
  // multi select
  const [childrenAddresses, toggleChild, resetChildren] = useSelect(true)

  // on unmount
  useEffect(() => {
    return () => {
      clearPreview(activeProject)
    }
  }, [])

  useEffect(() => {
    resetChildren()
    clearPreview(activeProject)
  }, [parentAddress])

  useEffect(() => {
    clearPreview(activeProject)
  }, [JSON.stringify(childrenAddresses)])

  const validChildrenAddresses = parentAddress
    ? calculateValidChildren(
      parentAddress,
      connections,
      selectedOutcomes.map(g => g.headerHash)
    )
    : []

  const preview = () => {
    if (!parentAddress || !childrenAddresses.length) return
    previewConnections(parentAddress, childrenAddresses, activeProject)
  }

  const save = async () => {
    if (!parentAddress || !childrenAddresses.length) return
    try {
      await saveConnections(parentAddress, childrenAddresses, activeProject)
      onClose()
    } catch (e) {
      console.log(e)
    }
    clearPreview(activeProject)
  }

  return (
    <CSSTransition
      in={isOpen}
      timeout={100}
      unmountOnExit
      classNames='connection-connector-picker-wrapper'>
      <PickerTemplate
        className='connection-connector-picker'
        heading='Connect'
        onClose={onClose}>
        <div className='connection-connector-content'>
          {/* Parent */}
          <div className='connection-connector-dropdown-wrapper'>
            <label htmlFor='parent'>Parent</label>

            <Select
              toggleSelectOption={toggleParent}
              toggleLabel={
                parentAddress &&
                  selectedOutcomes.find(s => s.headerHash === parentAddress)
                  ? selectedOutcomes.find(s => s.headerHash === parentAddress).content
                  : 'Pick one'
              }>
              {selectedOutcomes.map(selectedOutcome => (
                <Option
                  key={selectedOutcome.headerHash}
                  value={selectedOutcome.headerHash}
                  label={selectedOutcome.content}
                  selected={parentAddress === selectedOutcome.headerHash}
                />
              ))}
            </Select>
          </div>
          {/* Children */}
          <div className='connection-connector-dropdown-wrapper'>
            <label htmlFor='children'>Children</label>

            <Select
              multiple
              toggleSelectOption={toggleChild}
              toggleLabel={`${childrenAddresses.length} card${childrenAddresses.length === 1 ? '' : 's'
                }`}>
              {selectedOutcomes
                .filter(g => validChildrenAddresses.includes(g.headerHash))
                .map(selectedOutcome => (
                  <Option
                    key={selectedOutcome.headerHash}
                    value={selectedOutcome.headerHash}
                    label={selectedOutcome.content}
                    selected={childrenAddresses.includes(selectedOutcome.headerHash)}
                  />
                ))}
            </Select>
          </div>
          <div className='connection-connector-buttons'>
            <Button
              onClick={preview}
              text='Preview'
              size='small'
              className='green'
              stroke
            />
            <Button
              onClick={save}
              text='Save Changes'
              size='small'
              className='purple'
            />
          </div>
        </div>
      </PickerTemplate>
    </CSSTransition>
  )
}
