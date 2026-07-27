# CLAUDE.md — homeport-infrastructure-apps

Durable context for this repo. Keep it tight and high-signal; full procedures live in
`DEPLOYMENT.md` (server setup) and `CONTRIBUTING.md` (repo conventions) — read those
before making changes, don't duplicate their content here.

## What this repo is

Infrastructure for a single-node k3s home lab, plus Portainer's leftover Docker Compose
config. There is no application source code here — this is YAML (Helm charts, ArgoCD
manifests), a couple of Dockerfiles, and docs. The `packages/*` shared configs
(`eslint-config`, `prettier-config`, `ts-config`) exist only to lint/format the repo's
own root-level JS/config files; they're not backing any real app.

## Repository structure

- `core/` — plumbing the cluster can't function without: DNS (`pi-hole`), the secrets
  manager (`infisical`), the secret-sync operator (`infisical-operator`), TLS renewal
  (`cert-renewal`).
- `infrastructure/` — tools that add management/visibility value: GitOps (`argocd`),
  the cluster dashboard (`headlamp`).
- Each app folder colocates its Docker artifacts (if any) with a `k8s/` subfolder
  holding its Kubernetes manifests — a full local Helm chart, or just
  `values.yaml`/`values-prod.yaml` for an upstream chart.
- Apps belonging to other repos (e.g. `vaultwarden` in `homeport-personal-apps`) are
  deployed onto this cluster via ArgoCD, but their code stays in their own repo.

## GitOps loop

ArgoCD runs an "app of apps" pattern (`infrastructure/argocd/k8s/root.yaml`) watching
`infrastructure/argocd/k8s/applications/`. Adding an app to ArgoCD means adding one
`Application` manifest there — no extra `kubectl apply`.

Apps with a custom Docker image (currently just Infisical) release on a **version tag**
(`<app>-v<version>`, e.g. `infisical-v1.2.3`), not on every push — see
`.github/workflows/infisical-build-push.yml`. Pushing the tag builds the image, pushes
it to Docker Hub, and commits the bumped tag into that app's `values.yaml`; ArgoCD
picks up the commit from there.

## Conventions

- No migration-phase, task-number, or process-narrative language in YAML/config
  comments — only technical rationale or a description of what the field/app is.
- Conventional Commits, enforced by commitlint (`husky` `commit-msg` hook).
- `helm.sh/resource-policy: keep` on every standalone PVC (not on StatefulSet
  `volumeClaimTemplates`, which Helm doesn't track) — local-path's reclaim policy is
  `Delete`, so this is what stops `helm uninstall` from wiping real data.
