import React from 'react'

export type ProgressRingProps = {
  progress: number
}

const ProgressRing: React.FC<ProgressRingProps> = ({ progress }) => {
  // this value represents circumference
  // of the circle. We get it by:
  // 2 * r * PI -> 2 * 8.5 * PI = 53
  const circumference = 53

  // circumference = stroke-dasharray
  // stroke-dashoffset = stroke-dasharray - (progress-point/100) * stroke-dasharray
  const dashoffset = circumference - (progress / 100) * circumference
  return (
    <span
      style={{
        transform: 'rotate(-90deg)',
        width: '22px',
        height: '22px',
        display: 'inline-flex',
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="22"
        height="22"
        viewBox="0 0 22 22"
      >
        <circle
          style={{ transition: 'stroke-dashoffset 0.35s;' }}
          stroke="var(--text-color-placeholder)"
          stroke-width="5"
          stroke-linecap="round"
          fill="transparent"
          cx="50%"
          cy="50%"
          // r = ( width * 2 ) - stroke-width
          r="8.5"
        />
        <circle
          style={{ transition: 'stroke-dashoffset 0.35s;' }}
          stroke="var(--color-ultramarine-blue)"
          stroke-width="5"
          stroke-linecap="round"
          fill="transparent"
          cx="50%"
          cy="50%"
          r="8.5"
          stroke-dasharray={circumference.toString()}
          stroke-dashoffset={dashoffset}
        />
      </svg>
    </span>
  )
}

export default ProgressRing
