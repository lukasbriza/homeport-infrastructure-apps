import * as openpgp from 'openpgp'

export const getPassboltPrivateKey = async () => {
  const uriKey = decodeURIComponent(String(process.env.API_USER_PRIVATE_KEY))
  const privateKey = await openpgp.decryptKey({
    privateKey: await openpgp.readPrivateKey({ armoredKey: uriKey }),
    passphrase: String(process.env.API_USER_PASSPHRASE),
  })
  return privateKey
}
