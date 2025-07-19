# Deployment Guide

## Overview

This guide outlines the steps required to deploy infrastructure applications in a production environment.

## Steps

1. Deploy Portainer with Pi-hole (Optional)
2. Prepare Infisical enviroment variables
3. Deploy architecture applications
4. Add Machine identity variables in `api-processor`

---

## Deploy Portainer with Pi-hole (Optional)

1. Create a `.env` file based on the local template:

   Fill in the `.env` files with your production values for Portainer and Pi-hole (Optional).

2. Build the production Docker Compose file for core applications:

   ```bash
   pnpm run core-docker:build-prod
   ```

3. Push the production Docker Compose file:

   ```bash
   pnpm run core-docker:push-prod
   ```

4. Open an SSH connection to your production server and copy the following files into the target directory on the remote machine:

   - `docker-compose-prod.core.yaml`

Copy to remote server also your created `.env` file into directory with your compose file.

5. On the remote machine, navigate to the directory containing the copied files

For deploy with Pi-hole run:

```bash
docker compose -f docker-compose-prod.core.yaml --profile DNS up --build -V -d
```

For deploy without Pi-hole run:

```bash
docker compose -f docker-compose-prod.core.yaml up --build -V -d
```

## Prepare Infisical enviroment variables

1. Run following command and add output to `.env` `ENCRYPTION_KEY` variable.

```bash
openssl rand -hex 16
```

2. Run following command and add output to `.env` `AUTH_SECRET` variable.

```bash
openssl rand -base64 32
```

3. Create adequate postgress password and assign it into `POSTGRES_PASSWORD` variable.
   Fill other required variables after the pattern in `.env.local`.
   If you are redeployng with existing data, fill variables that match
   your previous deployment to be able to access data (f.e. database credentials).

## Deploy architecture applications

1. Create `.env` file in root of repository with all necessary variables mentioned in `docker-compose-prod`.

2. Build production cointainers:

   ```bash
   pnpm run deployment-docker:build-prod
   ```

3. Push production images into homeport Docker registry:

   ```bash
   pnpm run deployment-docker:push-prod
   ```

4. If it is your first deploy, configure new stack in Portainer (Github build method). Then add enviroment variables from your prepared `.env` file. Variables for `api-processor` need to be filled later, first you need to get necessary credentials from other applications to access them. If stack already exists just press `Pull and redeploy` with re-pulling of images.

5. Configure NGINX atleast for Jenkins service to be reachable from the internet. This is crucial for CI/CD pipelines in other projects.

6. Open Infisical on deployed address and configure general settings (Github OAuth integrations etc.)

   6.1. Create new Machine identity access described in guide of Infisical: https://infisical.com/docs/documentation/platform/identities/universal-auth

   6.2. Add INFISICAL_CLIENT_ID and INFISICAL_CLIENT_SECRET values into enviroment variables of `api-processor` application.

# Pipeline triggering

Jenkinse pipelines are triggered on tag push. Ensure to have correct format of pipeline: `<platform>/<project_name>/<environment_short>/<version>`

- `<platform>` - should be in lowercase format (like slug in Infisical)
- `<project>` - should be in same format like in repository
- `<environment_short>` - short name of environment (can be gound in Infisical)
- `<version>` - version number
