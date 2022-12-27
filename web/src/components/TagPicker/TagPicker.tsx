import React, { useEffect, useState } from 'react'
import { ActionHashB64, WithActionHash } from '../../types/shared'
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
  tags: WithActionHash<TagType>[]
  selectedTags: ActionHashB64[]
  onChange: (newSelectedTags: ActionHashB64[]) => void
  filterText: string
  setFilterText: (text: string) => void
  setIsCreateOrEditTagOpen: React.Dispatch<React.SetStateAction<boolean>>
  setEditingTagID: React.Dispatch<React.SetStateAction<string>>
}

const TagPickerDisplayTags: React.FC<TagPickerDisplayTagsProps> = ({
  tags,
  selectedTags,
  onChange,
  filterText,
  setFilterText,
  setIsCreateOrEditTagOpen,
  setEditingTagID,
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
            const isChecked = selectedTags.includes(tag.actionHash)
            const onSelectOption = (isChecked: boolean) => {
              if (isChecked && !selectedTags.includes(tag.actionHash)) {
                // add it, since its not there
                onChange([...selectedTags, tag.actionHash])
              } else if (!isChecked && selectedTags.includes(tag.actionHash)) {
                // remove it, since its there and shouldn't be
                onChange(
                  selectedTags.filter(
                    (actionHash) => actionHash !== tag.actionHash
                  )
                )
              }
            }
            return (
              <div key={tag.actionHash} className="tag-picker-tag-option">
                <div
                  className="tag-picker-selectable-area"
                  onClick={() => onSelectOption(!isChecked)}
                >
                  <Checkbox size="small" isChecked={isChecked} />
                  <Tag text={tag.text} backgroundColor={tag.backgroundColor} />
                </div>
                <div
                  className="tag-picker-edit-button"
                  onClick={() => {
                    setIsCreateOrEditTagOpen(true)
                    setEditingTagID(tag.actionHash)
                  }}
                >
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
        onClick={() => setIsCreateOrEditTagOpen(true)}
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
  savedTagText?: string
  savedTagColor?: string
}

const CreateOrEditTag: React.FC<CreateOrEditTagProps> = ({
  onCancel,
  onSave,
  savedTagText,
  savedTagColor,
}) => {
  const [hasTypedText, setHasTypedText] = useState(false)
  const [hasTypedColor, setHasTypedColor] = useState(false)
  const [tagText, setTagText] = useState(savedTagText ? savedTagText : '')
  const DEFAULT_TAG_COLOR = '#1DA094'
  const [tagColor, setTagColor] = useState(
    savedTagColor ? savedTagColor : DEFAULT_TAG_COLOR
  )
  const [colorPickerOpen, setColorPickerOpen] = useState(false)

  // update the internal state based on any changes
  // to the external state
  useEffect(() => {
    setTagText(savedTagText)
  }, [savedTagText])
  useEffect(() => {
    if (savedTagColor) {
      setTagColor(savedTagColor)
    } else {
      setTagColor(DEFAULT_TAG_COLOR)
    }
  }, [savedTagColor])

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
  tags: WithActionHash<TagType>[]
  selectedTags: ActionHashB64[]
  onChange: (newSelectedTags: ActionHashB64[]) => void
  filterText: string
  setFilterText: (text: string) => void
  onCreateTag: (text: string, backgroundColor: string) => Promise<void>
  onUpdateExistingTag: (
    actionHash: ActionHashB64,
    text: string,
    backgroundColor: string
  ) => Promise<void>
  onClose: () => void
}

const TagPicker: React.FC<TagPickerProps> = ({
  tags,
  selectedTags,
  onChange,
  filterText,
  setFilterText,
  onCreateTag,
  onUpdateExistingTag,
  onClose,
}) => {
  // if there aren't any tags, then it should
  // be open to the create tag panel by default
  const [isCreateOrEditTagOpen, setIsCreateOrEditTagOpen] = useState(
    !tags.length
  )

  // existing tag ID that is being edited
  const [editingTagID, setEditingTagID] = useState('')

  const onClickSaveTag = async (text: string, backgroundColor: string) => {
    if (editingTagID) {
      // if updating a tag
      await onUpdateExistingTag(editingTagID, text, backgroundColor)
    } else {
      // if creating a new tag
      await onCreateTag(text, backgroundColor)
    }
    setIsCreateOrEditTagOpen(false)
    setEditingTagID('')
  }

  // to define an existing tag being edited
  const tagBeingEdited = editingTagID
    ? tags.find((tag) => tag.actionHash === editingTagID)
    : null
  const selectedTagText = tagBeingEdited ? tagBeingEdited.text : ''
  const selectedTagColor = tagBeingEdited ? tagBeingEdited.backgroundColor : ''

  return (
    <div className="tag-picker-wrapper">
      {!isCreateOrEditTagOpen && (
        <TagPickerDisplayTags
          tags={tags}
          selectedTags={selectedTags}
          setEditingTagID={setEditingTagID}
          onChange={onChange}
          filterText={filterText}
          setFilterText={setFilterText}
          setIsCreateOrEditTagOpen={setIsCreateOrEditTagOpen}
        />
      )}
      {isCreateOrEditTagOpen && (
        <CreateOrEditTag
          savedTagText={selectedTagText}
          savedTagColor={selectedTagColor}
          onCancel={() => {
            if (tags.length) {
              setIsCreateOrEditTagOpen(false)
              setEditingTagID('')
            } else {
              onClose()
            }
          }}
          onSave={onClickSaveTag}
        />
      )}
    </div>
  )
}

export default TagPicker
