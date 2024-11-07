import * as yup from 'yup'

export const redeployStackSchema = yup.object().shape({
  stackId: yup.number().required(),
  endpointId: yup.number().required(),
  env: yup
    .array()
    .min(0)
    .of(yup.object().shape({ name: yup.string().required(), value: yup.string().required() })),
  repositoryAuthentication: yup.boolean().required(),
  repositoryUsername: yup.string().required(),
  repositoryPassword: yup.string().required(),
  repositoryReferenceName: yup.string().required(),
  prune: yup.boolean().required(),
  pullImage: yup.boolean().required(),
})
