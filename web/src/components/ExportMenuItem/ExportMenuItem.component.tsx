import React, { useState } from 'react'
import {
  exportDataHref,
  ExportType,
  ProjectExportData,
} from '../../migrating/export'

import Modal, { ModalContent } from '../Modal/Modal'

export type ExportMenuItemProps = {
  title: string
  downloadFilename: string
  type: ExportType
  data: ProjectExportData
  projectName: string
}

const ExportMenuItem: React.FC<ExportMenuItemProps> = ({
  downloadFilename,
  title,
  type,
  data,
  projectName,
}) => {
  const [popup, setPopup] = useState(false)

  return (
    <>
      {/* TODO: refactor this modal out of here! */}
      <Modal active={popup} onClose={() => setPopup(false)}>
        <ModalContent
          heading="Exporting"
          icon="export.svg"
          content={
            <>
              You just exported the <b>{projectName}</b> project data. You will
              be able to find it in your Downloads folder!
            </>
          }
          primaryButton="Got it"
          primaryButtonAction={() => setPopup(false)}
        />
      </Modal>
      <a
        href={exportDataHref(type, data)}
        onClick={() => {
          setPopup(true)
        }}
        download={downloadFilename}
      >
        {title}
      </a>
    </>
  )
}
export default ExportMenuItem
