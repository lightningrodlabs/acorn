import React, { useEffect } from 'react'
import { CSSTransition } from 'react-transition-group'
import './ConnectionConnectorPicker.scss'
import PickerTemplate from '../PickerTemplate/PickerTemplate'
import { Select, Option, useSelect } from '../Select/Select'
import Button from '../Button/Button'
import { calculateValidChildren } from '../../tree-logic'

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
  const [parentActionHash, toggleParent, resetParent] = useSelect()
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
  }, [parentActionHash])

  useEffect(() => {
    clearPreview(activeProject)
  }, [JSON.stringify(childrenAddresses)])

  const validChildrenAddresses = parentActionHash
    ? calculateValidChildren(
      parentActionHash,
      connections,
      selectedOutcomes.map(g => g.actionHash)
    )
    : []

  const preview = () => {
    if (!parentActionHash || !childrenAddresses.length) return
    previewConnections(parentActionHash, childrenAddresses, activeProject)
  }

  const save = async () => {
    if (!parentActionHash || !childrenAddresses.length) return
    try {
      await saveConnections(parentActionHash, childrenAddresses, activeProject)
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
                parentActionHash &&
                  selectedOutcomes.find(s => s.actionHash === parentActionHash)
                  ? selectedOutcomes.find(s => s.actionHash === parentActionHash).content
                  : 'Pick one'
              }>
              {selectedOutcomes.map(selectedOutcome => (
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
          <div className='connection-connector-dropdown-wrapper'>
            <label htmlFor='children'>Children</label>

            <Select
              multiple
              toggleSelectOption={toggleChild}
              toggleLabel={`${childrenAddresses.length} card${childrenAddresses.length === 1 ? '' : 's'
                }`}>
              {selectedOutcomes
                .filter(g => validChildrenAddresses.includes(g.actionHash))
                .map(selectedOutcome => (
                  <Option
                    key={selectedOutcome.actionHash}
                    value={selectedOutcome.actionHash}
                    label={selectedOutcome.content}
                    selected={childrenAddresses.includes(selectedOutcome.actionHash)}
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
