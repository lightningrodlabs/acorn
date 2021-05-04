const passphraseToUuid = passphrase => `uuid-${passphrase.split(' ').join('-')}`

const uuidToPassphrase = uuid =>
  uuid
    .replace('uuid-', '')
    .split('-')
    .join(' ')

export { passphraseToUuid, uuidToPassphrase }
