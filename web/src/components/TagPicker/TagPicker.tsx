import React, { useState } from 'react'
import { HeaderHashB64, WithHeaderHash } from '../../types/shared'
import { Tag as TagType } from '../../types'
import Button from '../Button/Button'
import Checkbox from '../Checkbox/Checkbox'
import Icon from '../Icon/Icon'
import Tag from '../Tag/Tag'
import ValidatingFormInput from '../ValidatingFormInput/ValidatingFormInput'

import './TagPicker.scss'

// @ts-ignore
import PopupTriangleWhite from '../../images/popup-triangle-white.svg'

export type TagPickerDisplayTagsProps = {
  tags: WithHeaderHash<TagType>[]
  selectedTags: HeaderHashB64[]
  onChange: (newSelectedTags: HeaderHashB64[]) => void
  filterText: string
  setFilterText: (text: string) => void
  setIsCreateTagOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const TagPickerDisplayTags: React.FC<TagPickerDisplayTagsProps> = ({
  tags,
  selectedTags,
  onChange,
  filterText,
  setFilterText,
  setIsCreateTagOpen,
}) => {
  return (
    <div className="tag-picker-display-tags-wrapper ">
      {/* search tag */}
      {tags.length > 0 && (
        <div className="tag-picker-filter">
          {/* @ts-ignore */}
          <Icon name="search.svg" size="small" className="grey not-hoverable" />
          <input
            type="text"
            onChange={(e) => setFilterText(e.target.value.toLowerCase())}
            value={filterText}
            placeholder="Search for a tag"
          />
          {filterText !== '' && (
            <div
              onClick={() => {
                setFilterText('')
              }}
              className="clear-button"
            >
              {/* @ts-ignore */}
              <Icon
                name="x.svg"
                size="small"
                className="light-grey not-hoverable"
                withTooltip
                tooltipText="Clear"
              />
            </div>
          )}
        </div>
      )}

      {/* Tags list */}
      <div className="tag-picker-list-wrapper">
        {tags
          .filter((tag) => {
            return filterText
              ? tag.text.toLowerCase().includes(filterText.toLowerCase())
              : true
          })
          .map((tag) => {
            const isChecked = selectedTags.includes(tag.headerHash)
            const onSelectOption = (isChecked: boolean) => {
              if (isChecked && !selectedTags.includes(tag.headerHash)) {
                // add it, since its not there
                onChange([...selectedTags, tag.headerHash])
              } else if (!isChecked && selectedTags.includes(tag.headerHash)) {
                // remove it, since its there and shouldn't be
                onChange(
                  selectedTags.filter(
                    (headerHash) => headerHash !== tag.headerHash
                  )
                )
              }
            }
            return (
              <div
                key={tag.headerHash}
                className="tag-picker-tag-option"
                onClick={() => onSelectOption(!isChecked)}
              >
                <Checkbox size="small" isChecked={isChecked} />
                <Tag text={tag.text} backgroundColor={tag.backgroundColor} />

                <div className="tag-picker-edit-button">
                  {/* @ts-ignore */}
                  <Icon
                    name="edit.svg"
                    className="light-grey not-hoverable"
                    size="small"
                  />
                </div>
              </div>
            )
          })}
      </div>

      {/* Create  */}
      <div
        className="create-new-tag-button"
        onClick={() => setIsCreateTagOpen(true)}
      >
        <div className="create-new-tag-button-icons">
          {/* @ts-ignore */}
          <Icon name="plus.svg" className="grey not-hoverable" />
          {/* @ts-ignore */}
          <Icon name="tag.svg" className="grey not-hoverable" />
        </div>
        Create a new tag
      </div>
    </div>
  )
}

/*
  CreateOrEditTag Component
*/

export type CreateOrEditTagProps = {
  onCancel: () => void
  onSave: (text: string, color: string) => Promise<void>
}

const CreateOrEditTag: React.FC<CreateOrEditTagProps> = ({
  onCancel,
  onSave,
}) => {
  const [hasTypedText, setHasTypedText] = useState(false)
  const [hasTypedColor, setHasTypedColor] = useState(false)
  const [tagText, setTagText] = useState('')
  const [tagColor, setTagColor] = useState('#1DA094')
  const [colorPickerOpen, setColorPickerOpen] = useState(false)
  const tagTextValid = tagText.length > 0
  const tagColorValid = tagColor.length > 0 && tagColor[0] === '#'
  const onClickSave = async () => {
    if (tagTextValid && tagColorValid) {
      return onSave(tagText, tagColor)
    }
  }

  // List of color swatches
  const colorList = [
    '#1DA094',
    '#103BB1',
    '#A0871D',
    '#4A1DA0',
    //
    '#104540',
    '#911DA0',
    '#447C21',
    '#A01D27',
    //
    '#2B7691',
    '#B45C11',
    '#60B10F',
    '#E27213',
    //
    '#ED868A',
    '#23CBBE',
    '#230EC7',
    '#E2BA13',
  ]

  return (
    <div className="create-or-edit-tag-wrapper">
      <div>
        {/* @ts-ignore */}
        <ValidatingFormInput
          value={tagText}
          onChange={(text: string) => {
            setHasTypedText(true)
            setTagText(text)
          }}
          invalidInput={hasTypedText && tagTextValid}
          validInput={tagTextValid}
          errorText={
            hasTypedText && !tagTextValid ? 'A label is required.' : ''
          }
          label="Label"
          placeholder="Release 0.6.2"
        />
        <div className="tag-picker-color-row">
          {/* @ts-ignore */}
          <ValidatingFormInput
            value={tagColor}
            onChange={(color: string) => {
              setHasTypedColor(true)
              setTagColor(color)
            }}
            invalidInput={hasTypedColor && !tagColorValid}
            validInput={tagColorValid}
            errorText={
              hasTypedColor && !tagColorValid
                ? 'A valid hex code is required.'
                : ''
            }
            label="Color"
            placeholder="#1DA094"
          />
          <div className="create-or-edit-tag-color-display-wrapper">
            {/* display color */}
            <div
              onClick={() => setColorPickerOpen(!colorPickerOpen)}
              className="create-or-edit-tag-color-swatch"
              style={{ backgroundColor: tagColor }}
            />
            {/* allow color changing */}
            {colorPickerOpen && (
              <div className="create-or-edit-tag-colors-wrapper">
                <img className="popup-triangle" src={PopupTriangleWhite} />
                {/* render each pre-defined color swatch from the list */}
                {colorList.map((colorPreset, index) => {
                  if (!colorList.includes(tagColor) && index === 0) {
                    colorPreset = tagColor
                  }
                  const isSelectedColor = tagColor === colorPreset
                  return (
                    <div
                      className={`create-or-edit-tag-color-swatch ${
                        isSelectedColor ? 'selected' : ''
                      }`}
                      style={{ backgroundColor: colorPreset }}
                      onClick={() => {
                        setTagColor(colorPreset)
                        setColorPickerOpen(false)
                      }}
                    >
                      {/* show a white check icon on the selected tag color swatch */}
                      {isSelectedColor && (
                        <Icon
                          name="check.svg"
                          size="small"
                          className="white not-hoverable"
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* create or edit tag buttons */}
      <div className="create-or-edit-tag-buttons">
        <Button text="Cancel" onClick={onCancel} size={'small'} secondary />
        <Button
          text="Save Changes"
          onClick={onClickSave}
          size={'small'}
          disabled={!tagColorValid || !tagTextValid}
        />
      </div>
    </div>
  )
}

/*

TagPicker default export Component

*/

export type TagPickerProps = {
  tags: WithHeaderHash<TagType>[]
  selectedTags: HeaderHashB64[]
  onChange: (newSelectedTags: HeaderHashB64[]) => void
  filterText: string
  setFilterText: (text: string) => void
  onSaveTag: (text: string, backgroundColor: string) => Promise<void>
  onClose: () => void
}

const TagPicker: React.FC<TagPickerProps> = ({
  tags,
  selectedTags,
  onChange,
  filterText,
  setFilterText,
  onSaveTag,
  onClose,
}) => {
  // if there aren't any tags, then it should
  // be open to the create tag panel by default
  const [isCreateTagOpen, setIsCreateTagOpen] = useState(!tags.length)
  const onSaveTagInner = async (text: string, backgroundColor: string) => {
    await onSaveTag(text, backgroundColor)
    setIsCreateTagOpen(false)
  }
  return (
    <>
      <div className="tag-picker-wrapper">
        {!isCreateTagOpen && (
          <TagPickerDisplayTags
            tags={tags}
            selectedTags={selectedTags}
            onChange={onChange}
            filterText={filterText}
            setFilterText={setFilterText}
            setIsCreateTagOpen={setIsCreateTagOpen}
          />
        )}
        {isCreateTagOpen && (
          <CreateOrEditTag
            onCancel={() => {
              if (tags.length) {
                setIsCreateTagOpen(false)
              } else {
                onClose()
              }
            }}
            onSave={onSaveTagInner}
          />
        )}
      </div>
    </>
  )
}

export default TagPicker
