import React from 'react'
import { exportDataHref, ExportType } from '../../migrating/export'

export type ExportMenuItemProps = {
  title: string
  downloadFilename: string
  type: ExportType
  data: string
  onClick: () => void
}

const ExportMenuItem: React.FC<ExportMenuItemProps> = ({
  downloadFilename,
  title,
  type,
  data,
  onClick,
}) => {
  return (
    <a
      href={exportDataHref(type, data)}
      onClick={onClick}
      download={downloadFilename}
    >
      {title}
    </a>
  )
}
export default ExportMenuItem
