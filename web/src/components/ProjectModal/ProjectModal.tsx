import React from 'react'
import './ProjectModal.scss'

import Button from '../Button/Button'
import Typography from '../Typography/Typography'

function ProjectModalHeading({ title }: { title: string }) {
  return (
    <div className="project-modal-heading">
      <Typography style="heading-modal">{title}</Typography>
    </div>
  )
}

function ProjectModalSubHeading({ title }: { title: string }) {
  return (
    <div className="project-modal-subheading">
      <Typography style="subtitle-modal">{title}</Typography>
    </div>
  )
}

function ProjectModalContent({ children }) {
  return <div className="project-modal-content">{children}</div>
}

function ProjectModalButton({
  text,
  onClick,
  disabled,
}: {
  text: React.ReactNode
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <div className="project-modal-button">
      <Button text={text} onClick={onClick} disabled={disabled} />
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
