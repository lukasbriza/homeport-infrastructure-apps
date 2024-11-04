import * as openpgp from 'openpgp'

export const getPassboltPrivateKey = async () => {
  const privateKey = await openpgp.decryptKey({
    privateKey: await openpgp.readPrivateKey({ armoredKey: process.env.API_USER_PRIVATE_KEY as string }),
    passphrase: process.env.APU_USE_PASSPHRASE as string,
  })
  return privateKey
}
