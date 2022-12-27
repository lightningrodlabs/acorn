import { ActionHashB64 } from '../types/shared'

export default function closestOutcomeToPageCoord(
  canvasCoords: { x: number; y: number },
  outcomeCoordinates: {
    [outcomeActionHash: ActionHashB64]: { x: number; y: number }
  }
) {
  let closestOutcomeActionHash: ActionHashB64
  let closestDistance: number = Infinity
  for (let outcomeActionHash in outcomeCoordinates) {
    const outcomeCoord = outcomeCoordinates[outcomeActionHash]
    // trig distance
    const distance = Math.sqrt(
      Math.pow(canvasCoords.x - outcomeCoord.x, 2) +
        Math.pow(canvasCoords.y - outcomeCoord.y, 2)
    )
    if (distance < closestDistance) {
      closestOutcomeActionHash = outcomeActionHash
      closestDistance = distance
    }
  }
  return closestOutcomeActionHash
}
