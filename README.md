# Homeport architecture apps

This repository is a **monorepo** that contains essential infrastructure services used in the **CI/CD process** of Homeport applications. It provides both local and production-ready Docker Compose configurations to streamline the deployment and management of DevOps tools.

## 🧭 Overview

### Core infrastructure application

Applications that must be deployed manually via ssh connection to prepare enviroment for [architecture](#architecture-applications) applications.

- **Portainer**: A lightweight management UI for Docker environments.
- **Pihole**: (Optional) Opensource DNS and DHCP solution.

### Architecture applications

Applications that should be deployed vie UI interface of [Portainer](#core-infrastructure-application) application.

- **Jenkins**: A highly customizable automation server for CI/CD, integrated with Passbolt and Portainer APIs via a custom `api-processor`.
- **Infisical**: An open-source secrets manager.
- **MariaDB**: A relational database used as backend for Passbolt.
- **Docker-in-Docker (dind)**: Enables Jenkins to build Docker images within containers for fully isolated builds.
- **API-processor**: Custom API driven apliccation that simplify Jenkins communication with Passbolt and Portainer
- **NGINX**: HTTP proxy server with UI administration.

Both **local development** and **production deployment** environments are supported using dedicated Docker Compose files.

## 📂 Structure

- `docker-compose-prod.yaml`: Production setup.
- `docker-compose-local.yaml`: Local development and testing setup.
- `apps/`: Contains individual services (e.g., Jenkins, api-processor).
- `packages/`: Contains shared code across `apps`

## ⚙️ Environments

### 🔧 Local Development

Build local compose file:

```bash
  pnpm run deployment-docker:build-local
```

Run local compose file:

```bash
  pnpm run deployment-docker:run-local
```

### 📋 Environment Variables

#### 📂 Volumes

```bash
HOST_JENKINS_DATA_PATH=<path_on_host>
HOST_JENKINS_CERTS_PATH=<path_on_host>
HOST_JENKINS_HOME_PATH=<path_on_host>
HOST_INFISICAL_DATABASE_DATA_PATH=<path_on_host>
HOST_INFISICAL_REDIS_DATA_PATH=<path_on_host>
HOST_PI_HOLE_DATA=<path_on_host>
HOST_PORTAINER_DATA_PATH=<path_on_host>
```

#### 🛠️ Jenkins

```bash
JENKINS_EXPOSE_PORT=<port>
PASSBOLT_API=<passbolt_api_url> - for internal usage of Jenkins scripts
PORTAINER_API=<portainer_api_url> - for internal usage of Jenkins scripts
PASSBOLT_API_USER_PASSPHRASE=<passphrase> - for API auth
PASSBOLT_API_USER_FINGERPRINT=<fingerprint> - for API auth
PASSBOLT_API_USER_PRIVATE_KEY=<private_key> - for API auth
```

### 💻 API processor

```bash
API_PROCESSOR_PORT=<port>
INFISICAL_API=<url>
INFISICAL_CLIENT_ID=<client_id>
INFISICAL_CLIENT_SECRET=<client_secret>
PORTAINER_API_ACESS_TOKEN=<token> - for API to access Portainer endpoints
PORTAINER_API=<portainer_api_url>
```

#### 💽 DB

```bash
MYSQL_RANDOM_ROOT_PASSWORD=<boolean>
MYSQL_DATABASE=<database_name>
MYSQL_USER=<user_name>
MYSQL_PASSWORD=<password>
```

#### 🔐 Infisical

```bash
NODE_ENV=<env>
ENCRYPTION_KEY=<encryption_key>
AUTH_SECRET=<secret>
POSTGRES_PASSWORD=<password>
POSTGRES_USER=<user_name>
POSTGRES_DB=<db>
DB_CONNECTION_URI=<postgres_database_url>
REDIS_URL=<internal_redis_url>
SITE_URL=<internal_url>
INFISICAL_BACKEND_PORT_EXPORT=<web_port>
INFISICAL_REDIS_PORT_EXPORT=<redis_port>
```

#### 📑 Pi-hole

```bash
FTLCONF_webserver_api_password=<dns_application_password>
```

#### ⚓ Portainer

```bash
PORTAINER_EXPOSE_PORT=<port>
```

#### 🔑 NGINX

```bash
NGINX_HTTP_PORT=<http_port>
NGINX_HTTPS_PORT=<https_port>
NGINX_ADMIN_WEB_PORT=<port>
```

## 📘 Additional Documentation

- 🛠️ **Contributing**: Interested in contributing? Please refer to [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines and best practices.
- 🚀 **Deployment**: For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).
