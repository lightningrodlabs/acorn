import React, { useEffect, useState } from 'react'
import { useStore } from 'react-redux'

import Modal from '../Modal/Modal'
import Button from '../Button/Button'
import Typography from '../Typography/Typography'
import { setTextInputFocused } from '../../redux/ephemeral/keyboard/actions'

import './AskDialog.scss'

// In-app, awaitable replacements for window.prompt / confirm / alert — none of
// which can be relied on here (Electron refuses prompt() outright; the Weave
// webview lacks all three). Call from ANYWHERE (components or plain modules):
//
//   const name = await askText({ heading: 'Name it', defaultValue: 'x' })
//   if (await askConfirm({ heading: 'Apply?', message: summary })) { … }
//   await tellUser({ heading: 'Blocked', message: why })
//   const dir = await askDirectory({ heading: 'Export where?' })  // folder picker
//
// <AskDialogHost /> is mounted ONCE at the App root and renders the requests
// through the standard Modal, one at a time (concurrent asks queue). Requests
// made before the host mounts queue too, so module init order doesn't matter.

type AskRequest =
  | {
      kind: 'text'
      heading: string
      message?: string
      defaultValue?: string
      placeholder?: string
      confirmLabel?: string
      resolve: (value: string | null) => void
    }
  | {
      kind: 'confirm'
      heading: string
      message: string
      confirmLabel?: string
      cancelLabel?: string
      resolve: (confirmed: boolean) => void
    }
  | {
      kind: 'notice'
      heading: string
      message: string
      resolve: () => void
    }
  | {
      kind: 'directory'
      heading: string
      message?: string
      defaultValue?: string
      resolve: (path: string | null) => void
    }

// the mounted host's enqueue, or null before mount / after unmount
let hostEnqueue: ((req: AskRequest) => void) | null = null
// requests made while no host is mounted, drained on mount
const preMountQueue: AskRequest[] = []

const submit = (req: AskRequest) => {
  if (hostEnqueue) hostEnqueue(req)
  else preMountQueue.push(req)
}

/** window.prompt replacement — resolves the entered text, or null on cancel. */
export function askText(opts: {
  heading: string
  message?: string
  defaultValue?: string
  placeholder?: string
  confirmLabel?: string
}): Promise<string | null> {
  return new Promise((resolve) => submit({ kind: 'text', ...opts, resolve }))
}

/** window.confirm replacement — resolves true on confirm, false on cancel. */
export function askConfirm(opts: {
  heading: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
}): Promise<boolean> {
  return new Promise((resolve) => submit({ kind: 'confirm', ...opts, resolve }))
}

/** window.alert replacement — resolves once the user dismisses it. */
export function tellUser(opts: {
  heading: string
  message: string
}): Promise<void> {
  return new Promise((resolve) => submit({ kind: 'notice', ...opts, resolve }))
}

/**
 * Ask for a DIRECTORY via the native folder picker — resolves an absolute path,
 * or null on cancel. Electron exposes each picked file's absolute `path`, which
 * is how the folder is derived; where that's unavailable (plain browser) or
 * underivable (an empty folder has no files to read paths from), the dialog
 * falls back to a typed path.
 */
export function askDirectory(opts: {
  heading: string
  message?: string
  defaultValue?: string
}): Promise<string | null> {
  return new Promise((resolve) => submit({ kind: 'directory', ...opts, resolve }))
}

// The absolute path of the folder a webkitdirectory input picked, from its file
// list: strip a file's directory-relative suffix off its absolute path, leaving
// the picked root. Null when paths aren't exposed (most webviews) or no files.
function dirFromPickedFiles(files: File[]): string | null {
  const f: any = files.length ? files[0] : null
  if (!f || typeof f.path !== 'string') return null
  const abs: string = f.path
  const rel: string = f.webkitRelativePath || f.name
  if (rel && abs.endsWith(rel)) {
    const base = abs.slice(0, abs.length - rel.length) // keeps trailing '/'
    if (f.webkitRelativePath) return base + rel.split('/')[0]
    return base.replace(/\/+$/, '') || '/'
  }
  return abs.slice(0, abs.lastIndexOf('/')) || '/'
}

// Fallback when the webview hides paths: the pick still yields the folder's NAME
// (webkitRelativePath's root segment) and its contained file names, so ask the
// dev bridge to walk the disk for a folder matching both. Dev-only by nature —
// with no bridge the fetch just fails and we return null.
async function dirFromBridgeLocate(files: File[]): Promise<string | null> {
  const rel = files.length ? (files[0] as any).webkitRelativePath : ''
  if (!rel || typeof rel !== 'string') return null
  const root = rel.split('/')[0]
  const names = files
    .slice(0, 5)
    .map((f: any) => (f.webkitRelativePath || '').split('/').slice(1).join('/'))
    .filter(Boolean)
  try {
    const res = await fetch('/__acorn_diff_locate_dir', {
      method: 'POST',
      body: JSON.stringify({ root, files: names }),
    })
    if (!res.ok) return null
    const j = await res.json()
    // only trust an unambiguous single match
    return Array.isArray(j.matches) && j.matches.length === 1
      ? j.matches[0]
      : null
  } catch {
    return null
  }
}

export const AskDialogHost: React.FC = () => {
  const store = useStore()
  const [pending, setPending] = useState<AskRequest[]>([])
  const [value, setValue] = useState('')
  // directory dialogs: shown when the picker couldn't yield a path (empty
  // folder, or a webview that doesn't expose file paths)
  const [dirHint, setDirHint] = useState('')
  const dirInput = React.useRef<HTMLInputElement>(null)

  useEffect(() => {
    hostEnqueue = (req) => setPending((p) => [...p, req])
    if (preMountQueue.length) {
      const drained = preMountQueue.splice(0)
      setPending((p) => [...p, ...drained])
    }
    return () => {
      hostEnqueue = null
    }
  }, [])

  const current = pending[0]

  // seed the text field per request, and own the keyboard while it shows so the
  // map's global shortcuts (Backspace = delete node…) don't fire while typing
  useEffect(() => {
    if (current && (current.kind === 'text' || current.kind === 'directory')) {
      setValue(current.defaultValue || '')
      setDirHint('')
      store.dispatch(setTextInputFocused(true))
      return () => {
        store.dispatch(setTextInputFocused(false))
      }
    }
  }, [current])

  if (!current) return null

  // resolve the current request and advance to the next queued one
  const finish = (resolveCurrent: () => void) => {
    resolveCurrent()
    setPending((p) => p.slice(1))
  }
  const onConfirm = () => {
    if (current.kind === 'text' || current.kind === 'directory')
      finish(() => current.resolve(value))
    else if (current.kind === 'confirm') finish(() => current.resolve(true))
    else finish(() => current.resolve())
  }
  const onCancel = () => {
    if (current.kind === 'text' || current.kind === 'directory')
      finish(() => current.resolve(null))
    else if (current.kind === 'confirm') finish(() => current.resolve(false))
    else finish(() => current.resolve())
  }
  // a folder was picked: resolve straight away when its path is derivable —
  // directly (Electron file.path) or via the dev bridge's disk walk — otherwise
  // keep the dialog open with the typed-path fallback highlighted
  const onDirPicked = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (current.kind !== 'directory') return
    const files = Array.from(e.target.files || [])
    e.target.value = ''
    if (!files.length) {
      setDirHint(
        'That folder is empty, so its location cannot be determined — type the path below instead.'
      )
      return
    }
    setDirHint('Locating the folder…')
    const dir = dirFromPickedFiles(files) || (await dirFromBridgeLocate(files))
    if (dir) finish(() => current.resolve(dir))
    else
      setDirHint(
        "Couldn't determine the folder's path — type it below instead."
      )
  }

  return (
    <Modal white active onClose={onCancel} className="ask-dialog-wrapper">
      <div className="ask-dialog">
        <div className="ask-dialog-heading">
          <Typography style="heading-modal">{current.heading}</Typography>
        </div>
        {'message' in current && current.message && (
          <div className="ask-dialog-message">
            <Typography style="body-modal">{current.message}</Typography>
          </div>
        )}
        {current.kind === 'text' && (
          <input
            className="ask-dialog-input"
            autoFocus
            value={value}
            placeholder={current.placeholder}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onConfirm()
              if (e.key === 'Escape') onCancel()
            }}
          />
        )}
        {current.kind === 'directory' && (
          <>
            <input
              ref={dirInput}
              type="file"
              style={{ display: 'none' }}
              // non-standard folder-picker attributes, not in React's typings
              {...({ webkitdirectory: '', directory: '' } as any)}
              onChange={onDirPicked}
            />
            <div className="ask-dialog-dir-browse">
              <Button
                text="Choose folder…"
                size="medium"
                onClick={() => dirInput.current?.click()}
              />
            </div>
            {dirHint && <div className="ask-dialog-hint">{dirHint}</div>}
            <div className="ask-dialog-dir-manual">
              <div className="ask-dialog-dir-manual-label">
                or enter a path:
              </div>
              <input
                className="ask-dialog-input"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onConfirm()
                  if (e.key === 'Escape') onCancel()
                }}
              />
            </div>
          </>
        )}
        <div className="ask-dialog-buttons">
          {current.kind !== 'notice' && (
            <Button
              text={
                (current.kind === 'confirm' && current.cancelLabel) || 'Cancel'
              }
              secondary
              size="medium"
              onClick={onCancel}
            />
          )}
          <Button
            text={
              current.kind === 'notice'
                ? 'OK'
                : current.kind === 'directory'
                ? 'Use typed path'
                : current.confirmLabel || 'OK'
            }
            size="medium"
            onClick={onConfirm}
          />
        </div>
      </div>
    </Modal>
  )
}
