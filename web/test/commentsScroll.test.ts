import { isNearBottom } from '../src/components/ExpandedViewMode/EVMiddleColumn/TabContent/EvComments/scrollPosition'

describe('isNearBottom()', () => {
  it('is true when scrolled all the way down', () => {
    expect(isNearBottom({ scrollTop: 600, scrollHeight: 1000, clientHeight: 400 })).toBe(true)
  })

  it('is true within the threshold of the bottom', () => {
    expect(isNearBottom({ scrollTop: 570, scrollHeight: 1000, clientHeight: 400 })).toBe(true)
  })

  it('is false when scrolled up to read older comments', () => {
    expect(isNearBottom({ scrollTop: 200, scrollHeight: 1000, clientHeight: 400 })).toBe(false)
  })

  it('is true when everything fits without scrolling', () => {
    expect(isNearBottom({ scrollTop: 0, scrollHeight: 300, clientHeight: 400 })).toBe(true)
  })
})
