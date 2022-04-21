import React from 'react'
import Checklist from '../../../../Checklist/Checklist'
import EvReadOnlyHeading from '../../../../EvReadOnlyHeading/EvReadOnlyHeading'
import Icon from '../../../../Icon/Icon'
import './EvTaskList.scss'

export type EvTaskListProps = {
  outcomeContent: string
  tasks: any[]
}

const EvTaskList: React.FC<EvTaskListProps> = ({ outcomeContent, tasks }) => {
  return (
    <div className="ev-children">
      <EvReadOnlyHeading
        headingText={outcomeContent}
        // @ts-ignore
        overviewIcon={<Icon name="activity-history.svg" />}
        overviewText={`${tasks.length} tasks`}
      />
      <div className="ev-children-outcome-list">
        <Checklist
          size="medium"
          listItems={[]}
          onChange={function (
            index: number,
            text: string,
            isChecked: boolean
          ): void {
            throw new Error('Function not implemented.')
          }}
          onAdd={function (newText: string): void {
            throw new Error('Function not implemented.')
          }}
          onRemove={function (index: number): void {
            throw new Error('Function not implemented.')
          }}
        />
      </div>
    </div>
  )
}

export default EvTaskList
