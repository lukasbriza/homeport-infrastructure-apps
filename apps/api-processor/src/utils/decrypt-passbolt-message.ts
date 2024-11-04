import * as openpgp from 'openpgp'

import { getPassboltPrivateKey } from './get-passbolt-private-key'

export const decryptPassboltMessage = async (encryptedMessage: string) => {
  const privateKey = await getPassboltPrivateKey()
  const message = await openpgp.readMessage({ armoredMessage: encryptedMessage })
  const { data } = await openpgp.decrypt({ message, decryptionKeys: privateKey })
  return data
}
