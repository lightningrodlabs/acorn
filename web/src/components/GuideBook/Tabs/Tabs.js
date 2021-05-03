import React from 'react'
import './Tabs.css'

export default function Tabs(props) {
  return (
    <div className='tabs'>
      <div className='tabs-links'>
        {props.tabs &&
          props.tabs.map((t, i) => (
            <button
              key={i}
              onClick={() => {
                props.toSelectTab(i)
              }}
              className={`tab-link ${i === props.selected ? 'active' : ''}`}>
              {t.title}
            </button>
          ))}
      </div>
      <div className='tabs-contents'>
        {props.children && props.children.length ? (
          props.children.map((item, i) => (
            <div
              key={i}
              className={`tab-content ${i === props.selected ? 'active' : ''}`}>
              {item}
            </div>
          ))
        ) : (
          <div
            className={`tab-content ${
              parseInt(props.children.key || 0) === props.selected
                ? 'active'
                : ''
            }`}>
            {props.children}
          </div>
        )}
        <div className='scroll-bottom-fade-effect' />
      </div>
    </div>
  )
}
