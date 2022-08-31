import React, { useEffect, useRef } from 'react'
import drawOutcome from '../../drawing/drawOutcome'
import { ComputedOutcome, Tag } from '../../types'
import { WithActionHash } from '../../types/shared'
import './MapViewDevMode.scss'

export type MapViewDevModeProps = {
  projectTags: WithActionHash<Tag>[]
  outcome: ComputedOutcome
  outcomeLeftX: number
  outcomeTopY: number
  outcomeHeight: number
  outcomeWidth: number
  // variants
  zoomLevel: number
  isTopPriority: boolean
  isSelected: boolean
}

const MapViewDevMode: React.FC<MapViewDevModeProps> = ({
  projectTags,
  outcome,
  outcomeLeftX,
  outcomeTopY,
  outcomeHeight,
  outcomeWidth,
  // variants
  zoomLevel,
  isTopPriority,
  isSelected,
}) => {
  const refCanvas = useRef<HTMLCanvasElement>()
  useEffect(() => {
    const canvas = refCanvas.current
    // Get the device pixel ratio, falling back to 1.
    const dpr = window.devicePixelRatio || 1
    // Get the size of the canvas in CSS pixels.
    const rect = canvas.getBoundingClientRect()
    // Give the canvas pixel dimensions of their CSS
    // size * the device pixel ratio.
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    const ctx = canvas.getContext('2d')
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    const args: Parameters<typeof drawOutcome>[0] = {
      projectTags,
      outcome,
      outcomeLeftX,
      outcomeTopY,
      outcomeHeight,
      outcomeWidth,
      zoomLevel,
      isSelected,
      isTopPriority,
      ctx: canvas.getContext('2d'),
    }
    drawOutcome(args)

    // card width is fixed on zoom level 100%
    // card height is dynamic based on the text length,
    // and whether it has tags, assignees and time
  })
  return (
    <div className="map-view-dev-mode">
      <canvas ref={refCanvas} />
    </div>
  )
}

export default MapViewDevMode
