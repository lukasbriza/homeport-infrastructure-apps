export const verifyEnv = (variables: (string | undefined)[]) => {
  for (const variable in variables) {
    if (!variable || variable.length === 0) {
      throw Error("Some of enviroment variables is not defined.")
    }
  }
}
