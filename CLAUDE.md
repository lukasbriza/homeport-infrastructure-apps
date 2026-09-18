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

- `core/` — plumbing the cluster depends on, plus optional cluster-wide capabilities
  apps opt into: DNS (`pi-hole`), the secrets manager (`infisical`), the secret-sync
  operator (`infisical-operator`), TLS renewal (`cert-renewal`), opt-in HTTP
  scale-to-zero (`keda`), the shared cold-start page (`coldstart-page`).
- `infrastructure/` — tools that add management/visibility value: GitOps (`argocd`),
  the cluster dashboard (`headlamp`, a local chart wrapping the upstream
  `headlamp/headlamp` chart as a Helm dependency, ArgoCD-managed like any app).
- Each app folder colocates its Docker artifacts (if any) with a `k8s/` subfolder
  holding its Kubernetes manifests — a full local Helm chart, or just
  `values.yaml`/`values-prod.yaml` for an upstream chart.
- Apps belonging to other repos (e.g. `vaultwarden` in `homeport-personal-apps`) are
  deployed onto this cluster via ArgoCD, but their code stays in their own repo.
- `turbo/generators/` and `templates/*` are inherited from the monorepo-template this
  repo was scaffolded from — they scaffold new **JS/TS** apps/packages and aren't used
  here. A new k8s app is added by copying an existing app's `k8s/` folder (see
  `DEPLOYMENT.md`/`CONTRIBUTING.md`), never via `pnpm turbo gen`.

## GitOps loop

ArgoCD runs an "app of apps" pattern (`infrastructure/argocd/k8s/root.yaml`) watching
`infrastructure/argocd/k8s/applications/`. Adding an app to ArgoCD means adding one
`Application` manifest there — no extra `kubectl apply`.

Apps with a custom Docker image (currently just Infisical) release on a **version tag**
(`<app>-v<version>`, e.g. `infisical-v1.2.3`), not on every push — see
`.github/workflows/infisical-build-push.yml`. Pushing the tag builds the image, pushes
it to Docker Hub, and commits the bumped tag into that app's `values.yaml`; ArgoCD
picks up the commit from there.

## Common tasks

Root scripts run through Turborepo across every workspace (`apps/*`, `core/*`,
`infrastructure/*`, `packages/*`) — but with no real application source here, only
`packages/*` (the shared config packages) and the repo's own root-level files actually
do anything:

```
pnpm lint       # turbo lint (--no-daemon) | pnpm lint:fix
pnpm ts         # turbo typecheck
pnpm format     # prettier --write "**/*.{ts,tsx,md}"
pnpm build      # turbo build — no-op outside packages/*
pnpm test       # turbo test — no-op, nothing has tests
pnpm dev        # turbo dev  — no-op, nothing has a dev server
```

## AI workflow

`.claude/` (skills, agents, commands, hooks) is inherited from the monorepo-template
and kept in sync via the `sync-template` skill (`.claude/skills/sync-template`). Most
of the synced skills (`coding-conventions`, `web-performance`, `native-performance`)
target React/Next/Nest/Expo code and don't apply here; the generic ones do —
`commit-and-pr` (Conventional Commits), `plan-project`, `writing-skills`.

- **Knowledge graph (graphify)**: the `graphifyy` CLI (installed per-machine —
  `pip install graphifyy`) builds a queryable graph of this repo into `graphify-out/`
  (gitignored, regenerable — never commit it). Build via the **terminal CLI**
  (`graphify .`), never through an agent — with no external key it falls back to using
  the *host agent itself* as its LLM, which burns Claude session quota summarizing
  every file.
  - **Code-only by default.** This repo's `.graphifyignore` excludes docs/images (so
    the build is AST-only — no LLM, no API key, no token cost) *and* the local runtime
    data dirs that aren't source at all: `core/infisical/data/`,
    `core/infisical/database/` (a live Postgres data directory), `core/pi-hole/data/`,
    `infrastructure/portainer/data/`. `.graphifyignore` **replaces** `.gitignore` for
    graphify rather than merging with it — keep both in sync if you add a new ignored
    path.
  - **Query instead of reading the graph**: `graphify query "…"`, `graphify path A B`,
    `graphify explain <node>`. Never read `graph.json`/`graph.html` directly into
    context (~1 MB each).

## Conventions

- No migration-phase, task-number, or process-narrative language in YAML/config
  comments — only technical rationale or a description of what the field/app is.
- Conventional Commits, enforced by commitlint (`husky` `commit-msg` hook).
- `helm.sh/resource-policy: keep` on every standalone PVC (not on StatefulSet
  `volumeClaimTemplates`, which Helm doesn't track) — local-path's reclaim policy is
  `Delete`, so this is what stops `helm uninstall` from wiping real data.
