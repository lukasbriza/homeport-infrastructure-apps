# Contributing Guide

## 📦 Repository Structure & Tooling

This repo has two top-level folders for apps, split by what they're for:

- `core/` — apps and cluster plumbing the environment can't function without
  (DNS, secrets manager, secret-sync operator, TLS renewal).
- `infrastructure/` — tools that add management or visibility value on top of a
  working cluster (GitOps, dashboards).

Each app folder colocates its Docker artifacts (if any) with its Kubernetes
manifests, in a `k8s/` subfolder next to the Dockerfile. See `DEPLOYMENT.md` for
how to actually install and run everything on a server.

---

## 🧪 Testing Guidelines

All applications and packages **must be covered by tests**, as long as it makes sense in the given context.

- Include a `test` script in your package's `package.json` so tests can be run globally across services via Docker.
- Aim for automated, reliable, and reproducible tests.
- Use meaningful test cases that reflect real-world usage.

## 🚀 Deployment Structure

Almost everything here runs on **Kubernetes (k3s)**. Each app's manifests live
in its own `k8s/` folder under `core/` or `infrastructure/` — there's no single
shared compose file for these. See `DEPLOYMENT.md` for the install order and
commands.

`docker-compose-local.core.yaml` still exists for local testing of apps before
they're deployed to k3s (currently just Pi-hole).

---

## 🏷️ Releasing app images

Apps with a custom Docker image (e.g. Infisical) don't rebuild on every push.
Pushing a version tag for that app triggers the build:

```bash
git tag <app>-v<version>   # e.g. infisical-v1.2.3
git push origin <app>-v<version>
```

This builds the image, pushes it to Docker Hub, and commits the new tag into
that app's `values.yaml` — ArgoCD picks it up from there. See
`.github/workflows/infisical-build-push.yml` for a working example, and
`DEPLOYMENT.md` for the full loop.

---

## ✅ Commit Conventions

We follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification. This standard makes commit history readable and automates versioning and changelog generation.

**Examples:**

```
feat(k3s): add headlamp dashboard
fix(infisical): correct ingress TLS secret name
chore(deps): upgrade pnpm to latest version
```

---

## 🧭 Final Notes

- Always create a branch for your feature or fix.
- Keep pull requests focused and small – one purpose per PR.
- Follow clean code principles: readable, maintainable, and testable code.
