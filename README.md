# Homeport infrastructure apps

Infrastructure for Lukáš Bříza's homeport home lab: a single k3s cluster plus a
couple of supporting pieces still on Docker.

## Structure

- `core/` — apps and cluster plumbing the environment can't function without:
  - `pi-hole` — DNS
  - `infisical` — secrets manager
  - `infisical-operator` — syncs secrets from Infisical into the cluster
  - `cert-renewal` — automatic TLS certificates (Wedos DNS-01)
- `infrastructure/` — tools that add management or visibility value on top of
  the cluster:
  - `argocd` — GitOps, deploys apps from git automatically
  - `headlamp` — cluster dashboard
- `docker/` — shared Docker base images (Node, Next.js, Postgres, MongoDB),
  not apps themselves.
- `packages/` — shared workspace config (`eslint-config`, `prettier-config`,
  `ts-config`).

Each app under `core/` or `infrastructure/` colocates its Docker artifacts (if
any) with its Kubernetes manifests, in a `k8s/` subfolder next to the
Dockerfile.

Apps that belong to other repos (e.g. `vaultwarden` in
`homeport-personal-apps`) are deployed onto this cluster via ArgoCD, but their
code and charts live in their own repo, not here.

## Deployment

Almost everything here runs on k3s. See [DEPLOYMENT.md](DEPLOYMENT.md) for the
full install order, from a clean server to a working cluster.

## CI/CD

Apps with a custom Docker image (currently just Infisical) build and release
through GitHub Actions, triggered by a version tag rather than every push —
see [CONTRIBUTING.md](CONTRIBUTING.md#-releasing-app-images).

## Documentation

- 🛠️ **Contributing**: see [CONTRIBUTING.md](CONTRIBUTING.md) for repo
  structure, testing, releasing images, and commit conventions.
- 🚀 **Deployment**: see [DEPLOYMENT.md](DEPLOYMENT.md) for step-by-step
  server setup.
