import React, { useEffect } from 'react'
import { CSSTransition } from 'react-transition-group'

import './EdgeConnectorPicker.css'

import PickerTemplate from '../PickerTemplate/PickerTemplate'
import { Select, Option, useSelect } from '../Select/Select'
import { calculateValidChildren } from '../EdgeConnectors/EdgeConnectors'
import {
  previewEdges,
  clearEdgesPreview,
  createEdge,
} from '../../redux/persistent/projects/edges/actions'

import Button from '../Button/Button'
import { connect } from 'react-redux'

function EdgeConnectorPicker({
  onClose,
  selectedGoals,
  edges,
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
      edges,
      selectedGoals.map(g => g.headerHash)
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
      classNames='edge-connector-picker-wrapper'>
      <PickerTemplate
        className='edge-connector-picker'
        heading='Connect'
        onClose={onClose}>
        <div className='edge-connector-content'>
          {/* Parent */}
          <div className='edge-connector-dropdown-wrapper'>
            <label htmlFor='parent'>Parent</label>

            <Select
              toggleSelectOption={toggleParent}
              toggleLabel={
                parentAddress &&
                  selectedGoals.find(s => s.headerHash === parentAddress)
                  ? selectedGoals.find(s => s.headerHash === parentAddress).content
                  : 'Pick one'
              }>
              {selectedGoals.map(selectedGoal => (
                <Option
                  key={selectedGoal.headerHash}
                  value={selectedGoal.headerHash}
                  label={selectedGoal.content}
                  selected={parentAddress === selectedGoal.headerHash}
                />
              ))}
            </Select>
          </div>
          {/* Children */}
          <div className='edge-connector-dropdown-wrapper'>
            <label htmlFor='children'>Children</label>

            <Select
              multiple
              toggleSelectOption={toggleChild}
              toggleLabel={`${childrenAddresses.length} card${childrenAddresses.length === 1 ? '' : 's'
                }`}>
              {selectedGoals
                .filter(g => validChildrenAddresses.includes(g.headerHash))
                .map(selectedGoal => (
                  <Option
                    key={selectedGoal.headerHash}
                    value={selectedGoal.headerHash}
                    label={selectedGoal.content}
                    selected={childrenAddresses.includes(selectedGoal.headerHash)}
                  />
                ))}
            </Select>
          </div>
          <div className='edge-connector-buttons'>
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

function mapStateToProps(state) {
  const selectedGoals = state.ui.selection.selectedGoals.map(headerHash => {
    return state.projects.goals[state.ui.activeProject][headerHash]
  })

  const edges = Object.values(state.projects.edges[state.ui.activeProject])

  return {
    selectedGoals,
    edges,
    activeProject: state.ui.activeProject,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    previewConnections: (parentAddress, childrenAddresses, activeProject) => {
      const edges = childrenAddresses.map(childAddress => ({
        child_address: childAddress,
        parent_address: parentAddress,
      }))
      return dispatch(previewEdges(activeProject, edges))
    },
    clearPreview: activeProject => {
      return dispatch(clearEdgesPreview(activeProject))
    },
    saveConnections: (parentAddress, childrenAddresses, cellIdString) => {
      // loop over childrenAddresses
      // use createEdge each time
      return Promise.all(
        childrenAddresses.map(childAddress =>
          dispatch(
            createEdge.create({
              cellIdString,
              payload: {
                child_address: childAddress,
                parent_address: parentAddress,
                randomizer: Date.now(),
                is_imported: false
              },
            })
          )
        )
      )
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(EdgeConnectorPicker)
