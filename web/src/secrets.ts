const passphraseToUid = (passphrase: string) =>
  `uid-${passphrase.split(' ').join('-')}`

const uidToPassphrase = (uid: string) =>
  uid.replace('uid-', '').split('-').join(' ')

export { passphraseToUid, uidToPassphrase }
