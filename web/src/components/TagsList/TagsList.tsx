import React, { useState } from 'react'
import { HeaderHashB64, WithHeaderHash } from '../../types/shared'
import { Tag as TagType } from '../../types'
import Tag from '../Tag/Tag'
import TagPicker from '../TagPicker/TagPicker'
import Icon from '../Icon/Icon'

import './TagsList.scss'

export type TagsListProps = {
  tags: WithHeaderHash<TagType>[]
  selectedTags: HeaderHashB64[]
  onChange?: (newSelectedTags: HeaderHashB64[]) => void
  onSaveTag?: (text: string, backgroundColor: string) => Promise<void>
  showAddTagButton: boolean
}

const TagsList: React.FC<TagsListProps> = ({
  tags,
  selectedTags,
  onChange,
  onSaveTag,
  showAddTagButton,
}) => {
  const [isOpenTagPicker, setIsOpenTagPicker] = useState(false)
  const [filterText, setFilterText] = useState('')
  return (
    // TODO: make on click outside possible to close the popup
    <div className="tags-list-wrapper">
      {selectedTags.map((tagHeaderHash) => {
        const tag = tags.find((tag) => tag.headerHash === tagHeaderHash)
        if (!tag) {
          return
        }
        return (
          <div key={tagHeaderHash} className="tags-list-item">
            <Tag text={tag.text} backgroundColor={tag.backgroundColor} />
          </div>
        )
      })}
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
            {tags.length === 0 && <span>Add a tag</span>}
            {tags.length > 0 && <span>Add/edit tags</span>}
          </div>
          {isOpenTagPicker && (
            <TagPicker
              tags={tags}
              selectedTags={selectedTags}
              onChange={onChange}
              onSaveTag={onSaveTag}
              filterText={filterText}
              setFilterText={setFilterText}
              onClose={() => {
                setIsOpenTagPicker(false)
                setFilterText('')
              }}
            />
          )}
        </div>
      )}
    </div>
  )
}

export default TagsList
