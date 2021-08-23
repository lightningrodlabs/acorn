import React from 'react'
import './ProjectModal.css'

import Button from '../Button/Button'

function ProjectModalHeading({ title }) {
  return <div className='project-modal-heading'>{title}</div>
}

function ProjectModalSubHeading({ title }) {
  return <div className='project-modal-subheading'><h4>{title}</h4></div>
}

function ProjectModalContent({ children }) {
  return <div className='project-modal-content'>{children}</div>
}

function ProjectModalButton({ text, onClick }) {
  return (
    <div className='project-modal-button'>
      <Button text={text} onClick={onClick} />
    </div>
  )
}

function ProjectModalContentSpacer({ children }) {
  return <div className='project-modal-content-spacer'>{children}</div>
}

export {
  ProjectModalHeading,
  ProjectModalSubHeading,
  ProjectModalButton,
  ProjectModalContent,
  ProjectModalContentSpacer,
}
