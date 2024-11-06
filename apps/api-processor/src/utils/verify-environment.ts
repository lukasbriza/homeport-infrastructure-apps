type ParameterMemeber = string | undefined

export const verifyEnvironment = (array: ParameterMemeber[]) => {
  for (const variable of array) {
    if (!variable || variable.length === 0) {
      throw new Error('Some of enviroment variables is not defined.')
    }
  }
}
