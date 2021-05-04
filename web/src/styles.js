// colors from https://flatuicolors.com/palette/nl
const colorPalette = [
  '#ED4C67', // bara red
  '#F79F1F', // radiant yellow
  '#FDA7DF', // lavendar rose
  '#12CBC4', // blue martina
  '#A3CB38', // android green
  '#1289A7', // meditranian sea
  '#D980FA', // lavendar tea
  '#B53471', // very berry
  '#EE5A24', // puffins bill
  '#009432', // pixelated grass
  '#0652DD', // marchant marine blue
  '#9980FA', // forgotten purple
  '#833471', // holly hock
  '#006266', // turkish aqua
  '#1B1464', // 20000 leagues under the sea
  '#5758BB', // circumorbital ring
  '#6F1E51', // magenta purple
]

function sumChars(str) {
  let sum = 0
  for (let i = 0; i < str.length; i++) {
    sum += str.charCodeAt(i)
  }

  return sum
}

const pickColorForString = string => {
  // pick a deterministic color from the list
  let index = sumChars(string) % colorPalette.length
  return colorPalette[index]
}

const colors = {
  Complete: '#83E300',
  Uncertain: '#FF5D36',
  Incomplete: '#FFC400',
  InProcess: '#FF9CAB',
  InReview: '#00E2FF',
}

const selectedColor = '#5F65FF'

export { colors, pickColorForString, selectedColor }
