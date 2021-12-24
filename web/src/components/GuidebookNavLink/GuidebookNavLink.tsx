import React, { MouseEventHandler } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

import { GUIDE_IS_OPEN } from '../../searchParams'

export default function GuidebookNavLink({
  guidebookId,
  children,
  className,
  onClick = () => {},
}: {
  guidebookId: string
  children: React.ReactElement | string
  className?: string
  onClick?: MouseEventHandler
}) {
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const openEntry = searchParams.get(GUIDE_IS_OPEN)
  return (
    <NavLink
      to={`${location.pathname}?${GUIDE_IS_OPEN}=${guidebookId}`}
      isActive={(match) => match && guidebookId === openEntry}
      className={className}
      onClick={onClick}
    >
      {children}
    </NavLink>
  )
}
