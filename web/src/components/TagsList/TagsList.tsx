import React, { useState } from 'react'
import { ActionHashB64, WithActionHash } from '../../types/shared'
import { Tag as TagType } from '../../types'
import Tag from '../Tag/Tag'
import TagPicker from '../TagPicker/TagPicker'
import Icon from '../Icon/Icon'

import './TagsList.scss'
import OnClickOutside from '../OnClickOutside/OnClickOutside'

export type TagsListProps = {
  tags: WithActionHash<TagType>[]
  selectedTags: ActionHashB64[]
  onChange?: (newSelectedTags: ActionHashB64[]) => void
  onCreateTag?: (text: string, backgroundColor: string) => Promise<void>
  onUpdateExistingTag?: (
    actionHash: ActionHashB64,
    text: string,
    backgroundColor: string
  ) => Promise<void>
  showAddTagButton: boolean
}

const TagsList: React.FC<TagsListProps> = ({
  tags,
  selectedTags,
  onChange,
  onCreateTag,
  onUpdateExistingTag,
  showAddTagButton,
}) => {
  const [isOpenTagPicker, setIsOpenTagPicker] = useState(false)
  const [filterText, setFilterText] = useState('')
  const onClose = () => {
    setIsOpenTagPicker(false)
    setFilterText('')
  }
  return (
    <div className="tags-list-wrapper">
      {/* Add/Edit Tags Button */}
      <OnClickOutside onClickOutside={onClose}>
        {showAddTagButton && (
          <div className="add-tag-button-with-tag-picker">
            <div
              className={`add-tag-button ${isOpenTagPicker ? 'active' : ''}`}
              onClick={() => {
                setIsOpenTagPicker(!isOpenTagPicker)
                setFilterText('')
              }}
            >
              <div className="add-tag-button-icons">
                {/* @ts-ignore */}
                <Icon name="plus.svg" className="grey not-hoverable" />
                {/* @ts-ignore */}
                <Icon name="tag.svg" className="grey not-hoverable" />
              </div>
              {selectedTags.length === 0 && <span>Add a tag</span>}
              {selectedTags.length > 0 && <span></span>}
            </div>
            {isOpenTagPicker && (
              <TagPicker
                tags={tags}
                selectedTags={selectedTags}
                onChange={onChange}
                onCreateTag={onCreateTag}
                onUpdateExistingTag={onUpdateExistingTag}
                filterText={filterText}
                setFilterText={setFilterText}
                onClose={onClose}
              />
            )}
          </div>
        )}
      </OnClickOutside>
      {/* Selected Tags */}
      {selectedTags.map((tagActionHash) => {
        const tag = tags.find((tag) => tag.actionHash === tagActionHash)
        if (!tag) {
          return
        }
        return (
          <div key={tagActionHash} className="tags-list-item">
            <Tag text={tag.text} backgroundColor={tag.backgroundColor} />
          </div>
        )
      })}
    </div>
  )
}

export default TagsList
