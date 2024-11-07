export const passboltPaths = {
  getPublicKey: '/auth/verify.json',
  login: '/auth/login.json',
  resources: '/resources.json',
  logout: '/auth/logout.json',
}

export const portainerPaths = {
  getStacks: '/api/stacks',
  getEndpoints: '/api/endpoints',
  deployStack: '/api/stacks/create/standalone/repository',
  redeployStack: (id: number) => `/api/stacks/${id}/git/redeploy`,
}
