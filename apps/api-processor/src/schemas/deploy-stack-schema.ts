import * as yup from 'yup'

export const deployStackSchema = yup.object().shape({
  endpointId: yup.number().required(),
  name: yup.string().required(),
  repositoryURL: yup.string().required(),
  repositoryAuthentication: yup.string().required(),
  repositoryUsername: yup.string().required(),
  repositoryPassword: yup.string().required(),
  repositoryReferenceName: yup.string().required(),
  composeFile: yup.string().required(),
  tlsskipVerify: yup.boolean().required(),
  fromAppTemplate: yup.boolean().required(),
  autoUpdate: yup
    .object()
    .shape({
      forcePullImage: yup.boolean(),
      forceUpdate: yup.boolean(),
      interval: yup.string().nullable(),
      jobID: yup.string().nullable(),
      webhook: yup.string().nullable(),
    })
    .nullable(),
  additionalFiles: yup.array().of(yup.string()).nullable(),
  env: yup
    .array()
    .of(yup.object().shape({ name: yup.string().required(), value: yup.string().required() }))
    .nullable(),
})
