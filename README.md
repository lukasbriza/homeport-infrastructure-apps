# Jenkins-Passbolt Setup on Homeport

This repository contains Docker configurations for deploying Jenkins and Passbolt on a personal server (Homeport). It provides both a local testing setup and a production configuration for ease of deployment.

## Overview

This setup includes Docker Compose configurations:
- `docker-compose.local.yaml` for local development and testing.
- `docker-compose.yaml` for production deployment.

Services include:
- **Jenkins**: Configured as a CI/CD tool for the server with custom api-processor for access to Passbolt and Portainer reosurces.
- **Passbolt**: Open-source password manager.
- **MariaDB**: Database service for Passbolt.
- **Docker-in-Docker (dind)**: Enables Jenkins to build Docker images within the container.

### Local Development
For local testing, use `docker-compose.local.yaml`. It exposes Jenkins on ports `8080` and `50000`, and Passbolt on ports `1001` (HTTP) and `1002` (HTTPS). Environment variables for local testing are defined in `.env` files located at:
- `apps/api-processor/.env`
- `apps/jenkins/.env`

### Production Deployment

For production, use `docker-compose.yaml`, which requires specific environment variables defined in an `.env` file in the project root. These variables configure ports, host paths, and secrets for production.

### Prerequisites

1. **Docker & Docker Compose**: Ensure you have Docker and Docker Compose installed on your server.
2. **Environment Variables**: Set up a `.env` file in the root directory with values for the following variables:


  # Required for both Jenkins and Passbolt
  HOST_JENKINS_DATA_PATH=<path_on_host>
  HOST_JENKINS_CERTS_PATH=<path_on_host>
  HOST_JENKINS_HOME_PATH=<path_on_host>
  HOST_PASSBOLT_DATABASE_PATH=<path_on_host>
  HOST_PASSBOLT_GPG_PATH=<path_on_host>
  HOST_PASSBOLT_JWT_PATH=<path_on_host>

  # Jenkins
  PASSBOLT_API=<passbolt_api_url>
  PASSBOLT_API_USER_PASSPHRASE=<passphrase>
  PASSBOLT_API_USER_FINGERPRINT=<fingerprint>
  PASSBOLT_API_USER_PRIVATE_KEY=<private_key>
  PORTAINER_API_ACESS_TOKEN=<api_key>
  PORTAINER_API=<portainer_api_url>

  # Passbolt
  APP_FULL_BASE_URL=<your_server_base_url>
  EMAIL_TRANSPORT_DEFAULT_HOST=<smtp_host>
  EMAIL_TRANSPORT_DEFAULT_PORT=<smtp_port>
  EMAIL_TRANSPORT_DEFAULT_USERNAME=<smtp_user>
  EMAIL_TRANSPORT_DEFAULT_PASSWORD=<smtp_password>

  # Production ports
  JENKINS_EXPOSE_PORT=8080
  PASSBOLT_EXPOSE_PORT=80
  PASSBOLT_EXPOSE_HTTPS_PORT=443

## Starting Services

1. **Local Development**:

   ```bash
   docker-compose -f docker-compose.local.yaml up -d

1. **Production Deployment**:
   ```bash
   docker-compose -f docker-compose.yaml up -d


