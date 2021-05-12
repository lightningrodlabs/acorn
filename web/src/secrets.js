const passphraseToUid = passphrase => `uid-${passphrase.split(' ').join('-')}`

const uidToPassphrase = uid =>
  uid
    .replace('uid-', '')
    .split('-')
    .join(' ')

export { passphraseToUid, uidToPassphrase }
