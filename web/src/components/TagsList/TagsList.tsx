import React, { useState } from 'react'
import Tag from '../Tag/Tag'
import TagPicker from '../TagPicker/TagPicker'
import Icon from '../Icon/Icon'

import './TagsList.scss'

export type TagData = {
  text: string
  backgroundColor: string
  id: string
}

export type TagsListProps = {
  tags: TagData[]
  showAddTagButton: boolean
}

const TagsList: React.FC<TagsListProps> = ({ tags, showAddTagButton }) => {
  const [isOpenTagPicker, setIsOpenTagPicker] = useState(false)

  return (
    <div className="tags-list-wrapper">
      {tags.map((tag) => {
        return (
          <div className="tags-list-item">
            <Tag text={tag.text} backgroundColor={tag.backgroundColor} />
          </div>
        )
      })}
      {showAddTagButton && (
        <div className="add-tag-button-with-tag-picker">
          <div
            className="add-tag-button"
            onClick={() => setIsOpenTagPicker(!isOpenTagPicker)}
          >
            <div className="add-tag-button-icons">
              <Icon name="plus.svg" className="grey not-hoverable" />
              <Icon name="tag.svg" className="grey not-hoverable" />
            </div>
            {tags.length === 0 && <span>Add a tag</span>}
            {tags.length > 0 && <span>Add/edit tags</span>}
          </div>
          {isOpenTagPicker && (
            <TagPicker
              tags={tags}
              selectedTags={[]}
              onChange={function (newSelectedTags: string[]): void {
                throw new Error('Function not implemented.')
              }}
            />
          )}
        </div>
      )}
    </div>
  )
}

export default TagsList
