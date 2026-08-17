# Deployment Guide

This guide walks through setting up this whole stack on a fresh Linux server, from
nothing to a working k3s cluster you can use.

## What you end up with

A **k3s** cluster (a lightweight Kubernetes) running everything: DNS, secrets, TLS
certificates, GitOps, and a cluster dashboard.

The repo has two folders for k3s apps:

- `core/` — things the cluster can't work without: DNS (`pi-hole`), the secrets
  manager (`infisical`), the operator that syncs secrets into the cluster
  (`infisical-operator`), and automatic TLS certificates (`cert-renewal`).
- `infrastructure/` — tools that make the cluster easier to manage: GitOps
  (`argocd`) and a cluster dashboard (`headlamp`).

Each app folder has a `k8s/` folder with its Kubernetes files.

## Requirements

- A fresh Linux server (these steps assume Ubuntu/Debian). You need `sudo` access.
- A domain name — only needed if you want things reachable from the internet with a
  real TLS certificate. You can skip the TLS steps and use everything internally
  without one.
- A [Wedos](https://www.wedos.com/) account with WAPI enabled — only needed for
  automatic TLS certificates.

Steps marked **(optional)** can be skipped and done later.

---

## 1. Get the code

```bash
git clone https://github.com/lukasbriza/homeport-infrastructure-apps.git
cd homeport-infrastructure-apps
```

## 2. Install k3s

```bash
curl -sfL https://get.k3s.io | sh -
```

This also installs Traefik, which handles all routing into the cluster — you don't
need to install a separate ingress controller.

Set up your kubeconfig so `kubectl` works without `sudo`:

```bash
mkdir -p ~/.kube
sudo cp /etc/rancher/k3s/k3s.yaml ~/.kube/config
sudo chown $(id -u):$(id -g) ~/.kube/config
kubectl get nodes
```

## 3. Install Helm

```bash
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
```

## 4. Set up automatic TLS certificates (optional)

Issues and renews TLS certificates for every app that needs one, using your Wedos
domain — works even without port 80 open to the internet.

1. In your Wedos customer portal, enable WAPI (Domains → WAPI) and note your Wedos
   login and WAPI password.

2. Create the namespace and a secret with your Wedos credentials (never put these in
   a file):

   ```bash
   kubectl create namespace cert-renewal
   kubectl create secret generic wedos-wapi-credentials \
     -n cert-renewal \
     --from-literal=WEDOS_Username="<your-wedos-login>" \
     --from-literal=WEDOS_Wapipass="<your-wapi-password>"
   ```

3. Apply the manifests:

   ```bash
   kubectl apply -f core/cert-renewal/k8s/
   ```

4. Test it manually:

   ```bash
   kubectl create job --from=cronjob/cert-renewal -n cert-renewal cert-renewal-test
   kubectl logs -n cert-renewal -l job-name=cert-renewal-test -f
   ```

It picks up domains automatically from every app's Ingress — nothing else to
configure per app. It runs once a day; a full run can take close to an hour because
DNS changes need time to propagate.

## 5. Deploy Infisical (secrets manager)

This is where passwords and API keys for every other app will live.

1. Create the secret with its encryption keys and database password (generate real
   random values, don't reuse these examples):

   ```bash
   kubectl create namespace infisical
   kubectl create secret generic infisical-backend-secrets \
     -n infisical \
     --from-literal=ENCRYPTION_KEY="$(openssl rand -hex 16)" \
     --from-literal=AUTH_SECRET="$(openssl rand -hex 32)" \
     --from-literal=POSTGRES_PASSWORD="$(openssl rand -hex 16)"
   ```

2. Copy `core/infisical/k8s/chart/values-prod.example.yaml` to
   `core/infisical/k8s/chart/values-prod.yaml` and fill in your domain.

3. Install:

   ```bash
   helm install infisical core/infisical/k8s/chart \
     -n infisical \
     -f core/infisical/k8s/chart/values.yaml \
     -f core/infisical/k8s/chart/values-prod.yaml
   kubectl get pods -n infisical
   ```

4. Once it's running, open it in your browser and create your admin account,
   following Infisical's own setup screens.

**Note:** `ENCRYPTION_KEY` cannot be changed later without losing access to
everything already stored. Back it up somewhere safe.

## 6. Set up the Infisical Kubernetes Operator

A cluster-wide component that syncs secrets from Infisical into Kubernetes Secrets,
so other apps can use them. You only install this once, no matter how many apps use
it later.

1. Install the operator:

   ```bash
   helm repo add infisical-helm-charts 'https://dl.cloudsmith.io/public/infisical/helm-charts/helm/charts/'
   helm repo update
   helm install infisical-operator infisical-helm-charts/secrets-operator \
     --namespace infisical-system --create-namespace
   kubectl get pods -n infisical-system
   ```

2. In Infisical, create a machine identity (Access Control → Identities → Create
   identity, auth method **Universal Auth**), following Infisical's guide:
   https://infisical.com/docs/documentation/platform/identities/universal-auth.
   Add it to whichever project holds your apps' secrets.

3. Create a Kubernetes Secret with that identity's credentials (never in a file):

   ```bash
   kubectl create secret generic infisical-universal-auth-credentials \
     -n infisical-system \
     --from-literal=clientId="<identity-client-id>" \
     --from-literal=clientSecret="<identity-client-secret>"
   ```

4. Edit `core/infisical-operator/k8s/01-connection.yaml` — set `address` to your
   Infisical URL from step 5. Then apply everything in order:

   ```bash
   kubectl apply -f core/infisical-operator/k8s/00-namespace.yaml \
     -f core/infisical-operator/k8s/01-connection.yaml \
     -f core/infisical-operator/k8s/02-auth.yaml
   ```

5. Check it worked:

   ```bash
   kubectl get infisicalauth homeport-infisical-auth -n infisical-system \
     -o jsonpath='{.status.conditions}' | jq
   ```

   Look for `"Status": "True"` on `secrets.infisical.com/IsReady`.

Any app can now reference this shared identity from its own Helm chart — see
`core/pi-hole/k8s/chart/templates/infisical-static-secret.yaml` for a working
example.

## 7. Deploy Pi-hole (DNS)

1. In Infisical, add a secret at path `/pi-hole` in your `prod` environment, with
   key `FTLCONF_webserver_api_password` and your chosen admin password. Note your
   project's ID (shown in its Infisical URL).

2. Copy `core/pi-hole/k8s/chart/values-prod.example.yaml` to
   `core/pi-hole/k8s/chart/values-prod.yaml` and fill in `projectId`.

3. Install:

   ```bash
   helm install pi-hole core/pi-hole/k8s/chart \
     -n pi-hole --create-namespace \
     -f core/pi-hole/k8s/chart/values.yaml \
     -f core/pi-hole/k8s/chart/values-prod.yaml
   kubectl get pods -n pi-hole
   ```

Pi-hole runs on the server's own network (not behind Traefik), because DNS needs a
real port 53, not a proxied one. Point your router or devices at this server's IP
for DNS.

## 8. Install ArgoCD (optional, for GitOps)

Once installed, ArgoCD watches this repo (and any app repo) and deploys what it
finds — instead of running `helm upgrade` by hand every time something changes.

1. Install:

   ```bash
   helm repo add argo https://argoproj.github.io/argo-helm
   helm repo update
   kubectl apply -f infrastructure/argocd/k8s/00-namespace.yaml
   helm install argocd argo/argo-cd -n argocd -f infrastructure/argocd/k8s/values.yaml
   kubectl get pods -n argocd
   ```

2. To reach it from a browser, copy
   `infrastructure/argocd/k8s/values-prod.example.yaml` to
   `infrastructure/argocd/k8s/values-prod.yaml`, fill in your domain, then:

   ```bash
   helm upgrade argocd argo/argo-cd -n argocd \
     -f infrastructure/argocd/k8s/values.yaml \
     -f infrastructure/argocd/k8s/values-prod.yaml
   ```

3. Get the initial admin password:

   ```bash
   kubectl -n argocd get secret argocd-initial-admin-secret \
     -o jsonpath='{.data.password}' | base64 -d
   ```

4. Set up the "app of apps" — one Application that manages all the others, so
   adding a new app later is just a new file, no extra `kubectl apply`:

   ```bash
   kubectl apply -f infrastructure/argocd/k8s/root.yaml
   ```

   This picks up every file under `infrastructure/argocd/k8s/applications/`,
   including the ones already there (`infisical`, `vaultwarden`). Sync them from
   the ArgoCD UI or:

   ```bash
   argocd app sync infisical
   argocd app sync vaultwarden
   ```

   Since Infisical is already installed manually from step 5, this just hands
   control of it over to ArgoCD — nothing changes for the running app.

### Adding a new app to ArgoCD

Create a file in `infrastructure/argocd/k8s/applications/`, following
`infrastructure/argocd/k8s/applications/vaultwarden.yaml` as a template: it just
needs the app's repo, the path to its Helm chart, and its namespace. Commit and
push — the root Application picks it up on its own.

Leave `syncPolicy` without `automated` until you've checked the app deploys
correctly with a manual sync. Add this once confirmed, so it deploys itself from
then on:

```yaml
syncPolicy:
  automated:
    prune: true
    selfHeal: true
```

## 9. Install Headlamp (optional cluster dashboard)

A web UI for the cluster itself — see pods, logs, and restart things without typing
`kubectl` commands.

1. Add the Helm repo:

   ```bash
   helm repo add headlamp https://kubernetes-sigs.github.io/headlamp/
   helm repo update
   ```

2. Copy `infrastructure/headlamp/k8s/values-prod.example.yaml` to
   `infrastructure/headlamp/k8s/values-prod.yaml` and fill in your domain (or leave
   `ingress.enabled: false` to keep it internal-only).

3. Install:

   ```bash
   helm install headlamp headlamp/headlamp -n headlamp --create-namespace \
     -f infrastructure/headlamp/k8s/values-prod.yaml
   kubectl get pods -n headlamp
   ```

4. Create a login token:

   ```bash
   kubectl apply -f infrastructure/headlamp/k8s/admin-token.yaml
   kubectl get secret headlamp-admin-token -n headlamp \
     -o jsonpath='{.data.token}' | base64 -d
   ```

5. Open Headlamp and log in with that token — either through your domain, or
   locally with:

   ```bash
   kubectl port-forward -n headlamp service/headlamp <local-port>:80
   ```

---

## How new app images get built and deployed

Apps that need a custom Docker image (like Infisical) use GitHub Actions, not a
build step on the server. Pushing a version tag for that app triggers a workflow
that builds the image, pushes it to Docker Hub, and commits the new image tag
into the app's `values.yaml` — ArgoCD (or a manual `helm upgrade`) then picks
that commit up and redeploys.

Tags follow `<app>-v<version>`, e.g.:

```bash
git tag infisical-v1.2.3
git push origin infisical-v1.2.3
```

Creating the tag is the deliberate "release this" moment — nothing builds just
from pushing to the Dockerfile. See `.github/workflows/infisical-build-push.yml`
for a working example to copy when adding this to a new app.
