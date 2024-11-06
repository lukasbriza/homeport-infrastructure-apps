import axios from 'axios'
import type { NextFunction, Request, Response } from 'express'
import { passboltPaths } from '../../paths'
import type { PublicKeyResponse } from '../../types'
import { decryptPassboltMessage, verifyEnvironment } from '../../utils'

export const authenticate = async (request: Request, response: Response, next: NextFunction) => {
  try {
    // VERIFY IF ENV VARIABLES SET
    verifyEnvironment([
      process.env.API_USER_FINGERPRINT,
      process.env.PASSBOLT_API,
      process.env.API_USER_PRIVATE_KEY,
      process.env.API_USER_PASSPHRASE,
    ])

    const getPublicKeyUrl = `${process.env.PASSBOLT_API}${passboltPaths.getPublicKey}`

    // GET PASSBOLT SERVER PUBLIC KEY
    const publicKeyResponse = await axios.get<{ body: PublicKeyResponse }>(getPublicKeyUrl)

    if (publicKeyResponse.status !== 200) {
      console.error(publicKeyResponse.data)
      throw new Error(`Obtaining passbolt server public key failed. URL: ${getPublicKeyUrl}`)
    }

    const serverPublicKey: string = publicKeyResponse.data.body.keydata

    if (!serverPublicKey) {
      console.error(publicKeyResponse.data)
      throw new Error('Passbolt server public key was not obtained.')
    }

    // MAKE 1ST STAGE OF LOGIN
    const apiUserFingerprint = process.env.API_USER_FINGERPRINT
    const loginUrl = `${process.env.PASSBOLT_API}${passboltPaths.login}`
    const login1stStageResponse = await axios.post(loginUrl, { data: { gpg_auth: { keyid: apiUserFingerprint } } })

    if (login1stStageResponse.status !== 200) {
      console.error(login1stStageResponse.data)
      throw new Error('Passbolt login Stage1 failed.')
    }

    if (
      !login1stStageResponse.headers['x-gpgauth-user-auth-token'] ||
      String(login1stStageResponse.headers['x-gpgauth-user-auth-token']).length === 0
    ) {
      console.error(login1stStageResponse.data)
      throw new Error('Can not find x-gpgauth-user-auth-token header.')
    }

    if (
      !login1stStageResponse.headers['x-gpgauth-progress'] ||
      login1stStageResponse.headers['x-gpgauth-progress'] !== 'stage1'
    ) {
      console.error(login1stStageResponse.headers)
      throw new Error('Can not find x-gpgauth-progress header with value `stage1`.')
    }

    const userPgpAuthToken = decodeURIComponent(String(login1stStageResponse.headers['x-gpgauth-user-auth-token']))
      .replace(String.raw`BEGIN\+PGP\+MESSAGE`, 'BEGIN PGP MESSAGE')
      .replace(String.raw`END\+PGP\+MESSAGE`, 'END PGP MESSAGE')

    const token = await decryptPassboltMessage(userPgpAuthToken)
    const login2ndStageResponse = await axios.post(loginUrl, {
      data: { gpg_auth: { keyid: apiUserFingerprint, user_token_result: token } },
    })

    request.body = {
      cookie: login2ndStageResponse.headers['set-cookie'],
    }

    if (
      (login2ndStageResponse.headers['x-gpgauth-authenticated'] !== 'true' &&
        login2ndStageResponse.headers['x-gpgauth-progress'] !== 'complete') ||
      login2ndStageResponse.status !== 200
    ) {
      throw new Error('Authentication failed. Please try again or debug code.')
    }

    next()
  } catch (error) {
    if (error instanceof Error) {
      response.status(400).json({ message: error.message }).send()
      return
    }
    response
      .status(400)
      .json({ message: `Unknown error: ${String(error)}` })
      .send()
  }
}
