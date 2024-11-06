FROM jenkins/jenkins:latest-jdk17 as base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV TURBO_TELEMETRY_DISABLED=1
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS="--max-old-space-size=4096"
ENV CI=true
ENV DOCKER=true
ENV TZ=Europe/Prague

USER root

# Install Node.js dependencies
RUN apt-get update && apt-get install -y curl gnupg && \
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

RUN apt-get update && \
    apt-get install -y jq && \
    apt-get install -y libc6 && \
    apt-get install -y libstdc++6 && \
    rm -rf /var/lib/apt/lists/* && \
    corepack enable

WORKDIR /application

COPY package.json .

RUN corepack prepare "$(jq -r '.packageManager' package.json)" --activate
RUN npm install turbo --global
RUN pnpm config set store-dir /application/.pnpm-store

FROM base as pruner

WORKDIR /application
COPY . .

# Prune workspace
RUN turbo prune @lukasbriza/api-processor --docker

FROM base as builder
COPY --from=pruner /application/.npmrc /application/tsconfig.json /application/.eslintrc.cjs /application/.prettierignore /application/prettier.config.js /application/

WORKDIR /application

# Copy lockfile and package.json's of isolated subworkspace
COPY --from=pruner /application/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=pruner /application/out/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=pruner /application/out/json/ .

# Copy source code of isolated subworkspace
COPY --from=pruner /application/out/full/ .

# First install the dependencies (as they change less often)
RUN --mount=type=cache,id=pnpm,target=/application/.pnpm-store pnpm install --frozen-lockfile

RUN turbo build --filter=@lukasbriza/api-processor

RUN --mount=type=cache,id=pnpm,target=/application/.pnpm-store pnpm prune --prod --no-optional
RUN rm -rf ./.turbo && \
    rm -rf ./**/*/src && \
    rm -rf ./**/*/test && \
    rm -rf ./**/*/tests && \
    rm -rf ./**/*/.turbo && \
    rm -rf ./**/*/*.md

RUN sh -c "rm -rf $(pnpm store path)"

FROM base as runner

ARG PORT=3001
ENV HOSTNAME="0.0.0.0"
ENV TZ=Europe/Prague
ENV NODE_ENV=production

COPY /cmd/start.sh /application/cmd/start.sh

RUN chmod +x /application/cmd/start.sh

WORKDIR /application
COPY --from=builder /application .


WORKDIR /application
USER jenkins

ENTRYPOINT ["/usr/bin/tini", "--", "/application/cmd/start.sh"]
