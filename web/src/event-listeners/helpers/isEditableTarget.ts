// True when a keyboard event is destined for a text-editing element (input,
// textarea, select, or any contenteditable). Used to suppress global tree
// directives (Enter/arrows/Backspace) while the user is typing — e.g. in the
// harness chat — so a keystroke never both types a character AND opens, moves,
// or deletes a node. This is a general safety net independent of any focus flag.
export default function isEditableTarget(event: Event): boolean {
  const el = (event.target as HTMLElement) || (document.activeElement as HTMLElement)
  if (!el) return false
  const tag = el.tagName
  return (
    tag === 'INPUT' ||
    tag === 'TEXTAREA' ||
    tag === 'SELECT' ||
    el.isContentEditable === true
  )
}
