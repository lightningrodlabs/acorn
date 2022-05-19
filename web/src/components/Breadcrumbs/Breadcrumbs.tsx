import React from 'react'
import { ComputedOutcome } from '../../types'
import { HeaderHashB64 } from '../../types/shared'
import Typography from '../Typography/Typography'
import './Breadcrumbs.scss'

export type BreadcrumbsProps = {
  outcomeAndAncestors: ComputedOutcome[]
  onClickItem?: (headerHash: HeaderHashB64) => void
}

const ANCESTOR_CUTOFF_LENGTH = 25
const CURRENT_OUTCOME_CUTOFF_LENGTH = 35

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  outcomeAndAncestors,
  onClickItem = () => {},
}) => {
  // everything up until the last one, which means all the ancestors
  // of the current one, in the same order as they're listed
  const ancestors = outcomeAndAncestors.slice(0, outcomeAndAncestors.length - 1)
  // the last in the list
  const currentOutcome = outcomeAndAncestors[outcomeAndAncestors.length - 1]

  if (!currentOutcome) {
    return <></>
  }

  return (
    <div className="breadcrumbs-wrapper">
      {ancestors.length > 0 && (
        <div className="breadcrumbs-parents">
          {ancestors.map((ancestorOutcome, index) => {
            const firstAncestor = 0
            const lastAncestor = ancestors.length - 1
            // for any ancestor that is not the absolute highest
            // but also not the direct ancestor, hide that text
            const textIsHidden = index > firstAncestor && index < lastAncestor
            return (
              <>
                <div
                  className="breadcrumbs-item"
                  onClick={() => onClickItem(ancestorOutcome.headerHash)}
                >
                  <Typography style="breadcrumbs">
                    {textIsHidden
                      ? ''
                      : ancestorOutcome.content.slice(
                          0,
                          ANCESTOR_CUTOFF_LENGTH
                        )}
                    {textIsHidden ||
                    ancestorOutcome.content.length > ANCESTOR_CUTOFF_LENGTH
                      ? '...'
                      : ''}
                  </Typography>
                </div>
                <Typography style="breadcrumbs">/</Typography>
              </>
            )
          })}
        </div>
      )}
      <div className="breadcrumbs-current-outcome">
        <Typography style="breadcrumbs-bold">
          {currentOutcome.content.slice(0, CURRENT_OUTCOME_CUTOFF_LENGTH)}
          {currentOutcome.content.length > CURRENT_OUTCOME_CUTOFF_LENGTH && (
            <>...</>
          )}
        </Typography>
      </div>
    </div>
  )
}

export default Breadcrumbs
