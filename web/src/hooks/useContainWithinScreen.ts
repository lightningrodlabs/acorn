import { useEffect, useState } from 'react'

export default function useContainWithinScreen({
  cursorCoordinate,
  initialWidth,
  initialHeight,
}: {
  cursorCoordinate: { x: number; y: number }
  initialWidth: number
  initialHeight: number
}) {
  // make the code below general purpose for any popup div that needs to be contained within the screen
  // the popup div will be rendered at the mouse click coordinate

  const [initialized, setInitialized] = useState(false)
  const [itemWidth, setItemWidth] = useState(initialWidth)
  // with useState store the height of the menu
  const [itemHeight, setItemHeight] = useState(initialHeight)
  const [renderCoordinate, setRenderCoordinate] = useState({
    x: cursorCoordinate.x,
    y: cursorCoordinate.y,
  })

  // set menu width in pixels
  // const menuWidth = 176

  // when the item height changes, determine weather to show the item above or below the mouse
  // if the menu will go off the screen, move it up so that it is fully visible

  useEffect(() => {
    if (itemHeight === 0) {
      return
    }
    // if both x and y are off the screen, move the item up and left
    if (
      cursorCoordinate.y + itemHeight > window.innerHeight &&
      cursorCoordinate.x + itemWidth > window.innerWidth
    ) {
      setInitialized(true)
      setRenderCoordinate({
        x: cursorCoordinate.x - itemWidth,
        y: cursorCoordinate.y - itemHeight,
      })
    }
    // if the item will go off the screen at the bottom edge, move it up so that it is fully visible
    else if (cursorCoordinate.y + itemHeight > window.innerHeight) {
      setInitialized(true)
      setRenderCoordinate({
        x: cursorCoordinate.x,
        y: cursorCoordinate.y - itemHeight,
      })
      // if the item will go off the screen at the right edge, move it left so that it is fully visible
    } else if (cursorCoordinate.x + itemWidth > window.innerWidth) {
      setInitialized(true)
      setRenderCoordinate({
        x: cursorCoordinate.x - itemWidth,
        y: cursorCoordinate.y,
      })
    } else {
      setInitialized(true)
    }
  }, [itemWidth, itemHeight, cursorCoordinate.x, cursorCoordinate.y])

  return {
    initialized,
    itemWidth,
    itemHeight,
    setItemWidth,
    setItemHeight,
    renderCoordinate,
  }
}
