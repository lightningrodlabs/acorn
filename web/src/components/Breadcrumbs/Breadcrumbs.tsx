import React from 'react'
import Typography from '../Typography/Typography'
import './Breadcrumbs.scss'

export type BreadcrumbsProps = {}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({}) => {
  return (
    <div className="breadcrumbs-wrapper">
      {/* TODO: dynamic rendering of parents */}
      <div className="breadcrumbs-parents">
        <Typography style="breadcrumbs">
          Acorn code is well organized / … / … / Acorn no longer uses a legacy
          unmaintained… /
        </Typography>
      </div>
      {/* TODO: dynamic rendering of outcome statement */}
      <div className="breadcrumbs-current-outcome">
        <Typography style="breadcrumbs-bold">
          New API in typescript definitions are written…
        </Typography>
      </div>
    </div>
  )
}

export default Breadcrumbs
