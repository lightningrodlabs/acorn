import React from 'react'

export type ProgressRingProps = {
  progress: number
  strokeWidth?: number
  size?: number
}

const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size = 22,
  strokeWidth = 5,
}) => {
  // since the stroke occurs from the "center"
  // of the arced line that runs around the
  // circumference of the circle, we have
  // to adjust for it
  const radius = (size - strokeWidth) / 2

  // this value represents circumference
  // of the circle. We use the fundamental
  // formula for circumference of a circle
  // to get it from the radius
  const circumference = 2 * radius * Math.PI

  // circumference = stroke-dasharray
  // stroke-dashoffset = stroke-dasharray - (progress-point/100) * stroke-dasharray
  const dashoffset = circumference - (progress / 100) * circumference
  return (
    <span
      className="progress-ring"
      style={{
        transform: 'rotate(-90deg)',
        width: `${size}`,
        height: `${size}`,
        display: 'inline-flex',
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size.toString()}
        height={size.toString()}
        viewBox={`0 0 ${size} ${size}`}
      >
        <circle
          style={{ transition: 'stroke-dashoffset 0.35s' }}
          stroke="var(--color-alto)"
          strokeWidth={`${strokeWidth}`}
          strokeLinecap="round"
          fill="transparent"
          cx="50%"
          cy="50%"
          r={radius}
          id="progress-ring-bg-circle"
        />
        <circle
          style={{ transition: 'stroke-dashoffset 0.35s' }}
          stroke="var(--color-ultramarine-blue)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="transparent"
          cx="50%"
          cy="50%"
          r={radius}
          strokeDasharray={circumference.toString()}
          strokeDashoffset={dashoffset}
        />
      </svg>
    </span>
  )
}

export default ProgressRing
