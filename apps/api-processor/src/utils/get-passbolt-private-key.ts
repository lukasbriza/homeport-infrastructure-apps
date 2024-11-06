import * as openpgp from 'openpgp'

export const getPassboltPrivateKey = async () => {
  const privateKey = await openpgp.decryptKey({
    privateKey: await openpgp.readPrivateKey({ armoredKey: String(process.env.API_USER_PRIVATE_KEY) }),
    passphrase: String(process.env.API_USER_PASSPHRASE),
  })
  return privateKey
}
