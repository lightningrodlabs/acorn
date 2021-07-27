import React from 'react'
import './PreferenceSelect.css'
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

export { PreferenceSelectExtra, PreferenceSelectOption }

function PreferenceSelect({
  iconName,
  title,
  subtitle,
  options,
  descriptions,
}: {
  iconName: string
  title: string
  subtitle: string
  options: React.ReactNode[]
  descriptions: React.ReactNode[]
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
      {descriptions}
    </div>
  )
}

export default PreferenceSelect
