export const verifyEnvironment = (variables: (string | undefined)[]) => {
  for (const variable of variables) {
    if (!variable || variable.length === 0) {
      throw new Error('Some of enviroment variables is not defined.')
    }
  }
}
