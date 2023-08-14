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

function sumChars(str: string) {
  let sum = 0
  for (let i = 0; i < str.length; i++) {
    sum += str.charCodeAt(i)
  }

  return sum
}

const pickColorForString = (string: string) => {
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

// map view colors

const SELECTED_COLOR = '#344cff'
const TOP_PRIORITY_GLOW_COLOR = '#334CF8'

// canvas outcome statement
const STATEMENT_FONT_COLOR = '#222222'
const STATEMENT_PLACEHOLDER_COLOR = '#CECECE'

// canvas outcome background colors
const DEFAULT_OUTCOME_BACKGROUND_COLOR = '#FFFFFF'
const NOT_ACHIEVED_BACKGROUND_COLOR = '#F7F5EF'
const ACHIEVED_BACKGROUND_COLOR = '#E9EFE7'

// canvas outcome border
const DEFAULT_OUTCOME_BORDER_COLOR = '#FFFFFF'
const NOT_ACHIEVED_BORDER_COLOR = '#A89958'
const ACHIEVED_BORDER_COLOR = '#15841D'
const IN_BREAKDOWN_BORDER_COLOR = '#C4631E'

// canvas outcome descendants achievement status
const DESCENDANTS_ACHIEVEMENT_STATUS_DEFAULT_FONT_COLOR = '#797979'
const DESCENDANTS_ACHIEVEMENT_STATUS_ACHIEVED_FONT_COLOR = '#15841D'

// canvas outcome tags
const TAGS_TAG_FONT_COLOR = '#FFFFFF'

// canvas outcome time and assignees
const TIME_ASSIGNEES_PLACEHOLDER_COLOR = '#B1B1B1'

// canvas outcome avatar
const AVATAR_INITIALS_TEXT_COLOR = '#FFFFFF'
const AVATAR_STROKE_COLOR = '#FFFFFF'

// canvas outcome time
const TIME_TEXT_COLOR = '#797979'

// canvas outcome progress bar
const PROGRESS_BAR_BACKGROUND_COLOR = '#D0D0D0'
const PROGRESS_BAR_FOREGROUND_COLOR = '#334CF8'

// canvas connection colors
const CONNECTION_ACHIEVED_COLOR = '#82B282'
const CONNECTION_NOT_ACHIEVED_COLOR = '#CDC2A2'

const SELF_ASSIGNED_STATUS_COLORS = {
  Online: '#00d0c0',
  Away: '#ffc400',
  Offline: '#d1d1d1',
}

export {
  colors,
  pickColorForString,
  STATEMENT_FONT_COLOR,
  STATEMENT_PLACEHOLDER_COLOR,
  SELECTED_COLOR,
  TOP_PRIORITY_GLOW_COLOR,
  DEFAULT_OUTCOME_BACKGROUND_COLOR,
  NOT_ACHIEVED_BACKGROUND_COLOR,
  ACHIEVED_BACKGROUND_COLOR,
  DEFAULT_OUTCOME_BORDER_COLOR,
  NOT_ACHIEVED_BORDER_COLOR,
  ACHIEVED_BORDER_COLOR,
  IN_BREAKDOWN_BORDER_COLOR,
  DESCENDANTS_ACHIEVEMENT_STATUS_DEFAULT_FONT_COLOR,
  DESCENDANTS_ACHIEVEMENT_STATUS_ACHIEVED_FONT_COLOR,
  TAGS_TAG_FONT_COLOR,
  TIME_ASSIGNEES_PLACEHOLDER_COLOR,
  AVATAR_INITIALS_TEXT_COLOR,
  AVATAR_STROKE_COLOR,
  TIME_TEXT_COLOR,
  PROGRESS_BAR_BACKGROUND_COLOR,
  PROGRESS_BAR_FOREGROUND_COLOR,
  SELF_ASSIGNED_STATUS_COLORS,
  CONNECTION_ACHIEVED_COLOR,
  CONNECTION_NOT_ACHIEVED_COLOR,
}
