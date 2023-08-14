import React from 'react'
import './ProjectModal.scss'

import Button from '../Button/Button'
import Typography from '../Typography/Typography'

function ProjectModalHeading({ title }) {
  return (
    <div className="project-modal-heading">
      <Typography style="heading-modal">{title}</Typography>
    </div>
  )
}

function ProjectModalSubHeading({ title }) {
  return (
    <div className="project-modal-subheading">
      <Typography style="subtitle-modal">{title}</Typography>
    </div>
  )
}

function ProjectModalContent({ children }) {
  return <div className="project-modal-content">{children}</div>
}

function ProjectModalButton({ text, onClick }) {
  return (
    <div className="project-modal-button">
      <Button text={text} onClick={onClick} />
    </div>
  )
}

function ProjectModalContentSpacer({ children }) {
  return <div className="project-modal-content-spacer">{children}</div>
}

export {
  ProjectModalHeading,
  ProjectModalSubHeading,
  ProjectModalButton,
  ProjectModalContent,
  ProjectModalContentSpacer,
}
