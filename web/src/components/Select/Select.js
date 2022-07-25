import React, { useState, useRef, useEffect } from 'react'
import useOnClickOutside from 'use-onclickoutside'
import { CSSTransition } from 'react-transition-group'

import './Select.scss'

import Icon from '../Icon/Icon'

function useSelect(multiple, preSelected = multiple ? [] : null) {
  // set a default from the options, if one is tagged as default in its props
  const [selected, setSelected] = useState(preSelected)

  const toggleSelectOption = value => {
    // in the case of single select
    if (!multiple) {
      setSelected(value)
      return
    }
    // in the case of 'multiple' multi-select
    // if value is selected
    if (selected.includes(value)) {
      // unselect it
      setSelected(selected.filter(actionHash => actionHash !== value))
    } else {
      // if value is not selected, add it
      setSelected(selected.concat([value]))
    }
  }

  const reset = () => {
    setSelected(multiple ? [] : null)
  }

  return [selected, toggleSelectOption, reset]
}

function Select({ toggleSelectOption, multiple, children, toggleLabel }) {
  const [selectOpen, setSelectOpen] = useState(false)

  const ref = useRef()
  useOnClickOutside(ref, () => setSelectOpen(false))

  const handleOptionClick = value => {
    return () => {
      toggleSelectOption(value)

      // in the case of single select
      if (!multiple) {
        setSelectOpen(false)
      }
    }
  }

  return (
    <div className='select-wrapper' ref={ref}>
      <div
        className={`select-toggle-wrapper ${selectOpen ? 'active' : ''}`}
        onClick={() => setSelectOpen(!selectOpen)}>
        <div className='select-toggle-label-text'>{toggleLabel}</div>
        <Icon
          name='chevron-down.svg'
          size='very-small'
          className={`grey ${selectOpen ? 'active' : ''}`}
        />
      </div>
      <CSSTransition
        in={selectOpen}
        timeout={200}
        unmountOnExit
        classNames='select-options'>
        <div className='select-options-wrapper'>
          {children.map(option => {
            return (
              <div
                key={option.props.value}
                className={`select-option-item-wrapper ${option.props.selected ? 'active' : ''
                  }`}
                title={option.props.label}
                onClick={handleOptionClick(option.props.value)}>
                {option}
              </div>
            )
          })}
        </div>
      </CSSTransition>
    </div>
  )
}

function Option({ selected, value, label }) {
  return <div className='select-option-item'>{label}</div>
}

export { useSelect, Select, Option }
