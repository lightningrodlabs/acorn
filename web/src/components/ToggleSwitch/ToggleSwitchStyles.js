const pxToRem = (px, oneRemPx = 17) => `${px / oneRemPx}rem`

export default (theme) => {
  const borderWidth = 2
  const width = pxToRem(70)
  const height = pxToRem(40)
  const size = pxToRem(28)
  const gap = (40 - 28) / 2
  const primaryColor = '#6A1DFF'
  return {
    root: {
      width,
      height,
      padding: 0,
      overflow: 'unset',
    },
    switchBase: {
      padding: pxToRem(gap),
      '&$checked': {
        color: '#fff',
        transform: `translateX(calc(${width} - ${size} - ${pxToRem(2 * gap)}))`,
        '& + $track': {
          backgroundColor: '#6A1DFF',
          opacity: 1,
        },
        '& $thumb': {
          backgroundColor: '#fff',
          backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 0 24 24" width="18"><path d="M0 0h24v24H0z" fill="none"/><path fill="${encodeURIComponent(
            primaryColor
          )}" d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>')`,
        },
      },
    },
    track: {
      borderRadius: 40,
      backgroundColor: '#D9D9D9',
      border: 'solid #fff',
      borderWidth,
      opacity: 1,
      height: 'auto',
    },
    thumb: {
      width: 18,
      height: 18,
      boxShadow: '0 0px 3px 0 RGB(0, 0 , 0, 0.1)',
      backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 0 24 24" width="18"><path fill="${encodeURIComponent(
        '#A8A8A8'
      )}" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/><path  d="M0 0h24v24H0z" fill="none"/></svg>')`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      padding: 4,
    },
    checked: {},
  }
}
