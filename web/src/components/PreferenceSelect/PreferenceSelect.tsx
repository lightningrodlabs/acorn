import React from 'react'
import './PreferenceSelect.scss'
import Icon from '../Icon/Icon'

function PreferenceSelectExtra({
  children,
}: {
  children: React.ReactNode | React.ReactNode[]
}) {
  return <div className="preference-select-description-wrapper">{children}</div>
}

function PreferenceSelectOption({
  active,
  onClick,
  iconName,
  iconExtraClassName,
  title,
}: {
  active: boolean
  onClick: () => void
  iconExtraClassName: string
  iconName: string
  title: string
}) {
  return (
    <div
      className={`preference-select-option ${active ? 'active' : ''}`}
      onClick={onClick}
    >
      <div className="preference-select-option-content">
        <div className={iconExtraClassName}>
          {/*  @ts-ignore */}
          <Icon name={iconName} size="large" className="not-hoverable" />
        </div>
        <div className="preference-select-option-text">{title}</div>
      </div>
    </div>
  )
}

function PreferenceSelectOptionColor({
  active,
  onClick,
  iconName,
  iconExtraClassName,
  title,
}: {
  active: boolean
  onClick: () => void
  iconExtraClassName: string
  iconName: string
  title: string
}) {
  return (
    <div
      className={`preference-select-option-color ${active ? 'active' : ''}`}
      onClick={onClick}
    >
      <div className="preference-select-option-color-content">
        <div className={iconExtraClassName}>
          {/*  @ts-ignore */}
          <Icon name={iconName} size="large" className="not-hoverable" />
        </div>
        <div className="preference-select-option-color-text">{title}</div>
      </div>
    </div>
  )
}

export { PreferenceSelectExtra, PreferenceSelectOption, PreferenceSelectOptionColor }

function PreferenceSelect({
  iconName,
  title,
  subtitle,
  options,
  descriptions,
  color,
}: {
  iconName: string
  title: string
  subtitle: string
  options: React.ReactNode[]
  descriptions: React.ReactNode[]
  color: React.ReactNode[]
}) {
  return (
    <div className="preference-select">
      <div className="preference-select-title-wrapper">
        {/* {iconName && (
          // @ts-ignore
          <Icon name={iconName} size="very-small" className="not-hoverable" />
        )} */}
        <div className="preference-select-title">{title}</div>
      </div>
      <div className="preference-select-subtitle">{subtitle}</div>
      <div className="preference-select-options-wrapper">{options}</div>
      <div className="preference-select-options-color-wrapper">{color}</div>
      {descriptions}
      {color}
    </div>
  )
}

export default PreferenceSelect
