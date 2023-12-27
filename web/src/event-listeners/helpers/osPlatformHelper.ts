
// The "modifier" key is different on Mac and non-Mac
// Pattern borrowed from TinyKeys library.
// --
// https://github.com/jamiebuilds/tinykeys/blob/e0d23b4f248af59ffbbe52411505c3d681c73045/src/tinykeys.ts#L50-L54
var macOsPattern = /Mac|macOS|iPod|iPhone|iPad/
let platform =
  // @ts-ignore
  navigator?.userAgentData?.platform || navigator?.platform || 'unknown'
const isMacish = macOsPattern.test(platform)
const operatingSystemModifier = isMacish ? 'metaKey' : 'ctrlKey'

export default function checkForKeyboardKeyModifier(
  event: KeyboardEvent
): boolean {
  return event[operatingSystemModifier]
}