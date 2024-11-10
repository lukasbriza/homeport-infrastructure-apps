FROM jenkins/jenkins:latest-jdk17

USER root
RUN apt update && \
    apt install -y docker.io && \
    mkdir -p ~/.docker/cli-plugins && \
    curl -SL https://github.com/docker/compose/releases/download/v2.3.3/docker-compose-linux-x86_64 -o ~/.docker/cli-plugins/docker-compose && \
    chmod +x ~/.docker/cli-plugins/docker-compose

USER jenkins

