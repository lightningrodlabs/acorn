import React, { useEffect, useState } from 'react'
import './ModalOutcomeNavigation.scss'
import Modal from '../Modal/Modal'
import ButtonClose from '../ButtonClose/ButtonClose'
import { navModalOutcomes } from '../../redux/ephemeral/navigation-modal/selector'
import { useDispatch } from 'react-redux'
import { animatePanAndZoom } from '../../redux/ephemeral/viewport/actions'

export type ModalOutcomeNavigationProps = {
  navigationModalIsOpen: boolean
  onClose: () => void
  navigateToOutcomeType: 'parent' | 'child'
}

const ModalOutcomeNavigation: React.FC<ModalOutcomeNavigationProps> = ({
  navigationModalIsOpen,
  onClose,
  navigateToOutcomeType,
}) => {
  const [selectedOption, setSelectedOption] = useState(0)
  const options = navModalOutcomes().reverse() // reverse list to match order of options to left->right on canvas
  const dispatch = useDispatch()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        setSelectedOption((prevState) => (prevState + 1) % options.length)
      } else if (e.key === 'ArrowUp') {
        setSelectedOption(
          (prevState) => (prevState + options.length - 1) % options.length
        )
      } else if (e.key === 'Enter') {
        const selectedOutcome = options[selectedOption]
        if (selectedOutcome) {
          // navigate to outcome
          e.stopPropagation()
          dispatch(animatePanAndZoom(selectedOutcome.actionHash, false))
          onClose()
          setSelectedOption(0)
        }
      } else if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
        setSelectedOption(0)
      }
    }

    if (navigationModalIsOpen) {
      window.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [options, navigationModalIsOpen])

  // if overflow scrolling is in effect, make the list view
  // move up or down depecnding on the arrow keys pressed
  useEffect(() => {
    const activeOptionElement = document.querySelector(
      '.modal-outcome-navigation-option.active'
    )
    activeOptionElement?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
    })
  }, [selectedOption])

  return (
    <div className="modal-outcome-navigation">
      <Modal active={navigationModalIsOpen}>
        <div className="close-button">
          <ButtonClose onClick={() => onClose()} size={'medium'} />
        </div>
        <div className="title">
          Select a {navigateToOutcomeType} to navigate to
        </div>
        <div className="options">
          {options.map((outcome, index) => {
            return (
              <div
                key={outcome.actionHash}
                className={`modal-outcome-navigation-option ${
                  index === selectedOption ? 'active' : ''
                }`}
                title={outcome.content}
              >
                {outcome.content}
              </div>
            )
          })}
        </div>
      </Modal>
    </div>
  )
}

export default ModalOutcomeNavigation
