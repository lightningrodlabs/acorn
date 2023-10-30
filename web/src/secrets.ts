// since this is a big wordset, dynamically import it
// instead of including in the main bundle
async function generatePassphrase() {
  const { default: randomWord } = await import('diceware-word')
  return `${randomWord()} ${randomWord()} ${randomWord()} ${randomWord()} ${randomWord()}`
}

const passphraseToUid = (passphrase: string) =>
  `uid-${passphrase.split(' ').join('-')}`

const uidToPassphrase = (uid: string) =>
  uid.replace('uid-', '').split('-').join(' ')

export { generatePassphrase, passphraseToUid, uidToPassphrase }
