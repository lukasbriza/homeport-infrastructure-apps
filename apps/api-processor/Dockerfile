ARG NODE_VERSION=22.11.0

################################
#Alpine image
FROM node:${NODE_VERSION}-alpine3.20 AS alpine

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV TURBO_TELEMETRY_DISABLED=1
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS="--max-old-space-size=4096"
ENV CI=true
ENV DOCKER=true

RUN sed -i 's|https://dl-cdn.alpinelinux.org/alpine/|http://mirror.fel.cvut.cz/alpine/|' /etc/apk/repositories && \
    apk update && \
    apk add --no-cache \
    openssl \
    libc6-compat \
    musl \
    musl-utils \
    musl-locales \
    libstdc++ \
    bash \
    curl \
    jq
RUN corepack enable
RUN rm -rf /var/cache/apk/*

COPY package.json .
RUN corepack prepare "$(jq -r '.packageManager' package.json)" --activate 
RUN rm package.json

################################
# Setup turbo on the alpine base
FROM alpine AS base
RUN npm install turbo --global

WORKDIR /application
RUN pnpm config set store-dir /application/.pnpm-store

################################
# Prune project
FROM base AS pruner

WORKDIR /application
COPY . .

RUN turbo prune @lukasbriza/api-processor --docker

################################
# Build the project
FROM base AS builder

# Copy codestyle configuration files
COPY --from=pruner /application/.npmrc /application/tsconfig.json /application/.eslintrc.cjs /application/.prettierignore /application/prettier.config.js /application/

WORKDIR /application

# Copy lockfile and package.json's of isolated subworkspace
COPY --from=pruner /application/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=pruner /application/out/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=pruner /application/out/json/ .

# Download node prune
RUN curl -sf https://gobinaries.com/tj/node-prune | sh

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
RUN node-prune
RUN sh -c "rm -rf $(pnpm store path)"

################################
# Final image
FROM alpine AS runner
ENV HOSTNAME="0.0.0.0"
ENV TZ=Europe/Prague
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs
USER nodejs

WORKDIR /application
COPY --from=builder --chown=nodejs:nodejs /application .

WORKDIR /application/apps/api-processor
ENTRYPOINT ["pnpm", "start:production"]
