import * as openpgp from 'openpgp'
import { getPassboltPrivateKey } from "./getPassboltPrivateKey"

export const decryptPassboltMessage = async (encryptedMessage: string) => {
  const privateKey = await getPassboltPrivateKey()
  const message = await openpgp.readMessage({ armoredMessage: encryptedMessage })
  const { data } = await openpgp.decrypt({ message, decryptionKeys: privateKey })
  return data
}
