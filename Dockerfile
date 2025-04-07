# -------------------------
# 1) Base image
# -------------------------
FROM node:22-bullseye-slim AS base

# Prepare pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN COREPACK_INTEGRITY_KEYS=0 corepack prepare pnpm@9.7.0 --activate \
  && corepack enable

WORKDIR /app

# -------------------------
# 2) Dependencies stage
# -------------------------
FROM base AS deps

# Copy only the files needed to install dependencies
COPY package.json pnpm-lock.yaml ./

# Install all dependencies (including dev) using BuildKit caching
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
  pnpm install --frozen-lockfile

# -------------------------
# 3) Build stage
# -------------------------
FROM deps AS build

# Copy the rest of the app source
COPY . .

# Use previously installed dependencies to build
RUN pnpm run build

# -------------------------
# 4) Production dependencies
# -------------------------
FROM base AS prod-deps

# Copy only the files needed to install production deps
COPY package.json pnpm-lock.yaml ./

# Install only production dependencies
# RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
# pnpm install --frozen-lockfile --prod

# (Alternatively, if you want to reuse the existing deps and just prune:)
COPY --from=deps /app/node_modules /app/node_modules
RUN pnpm prune --prod

# -------------------------
# 5) Final stage
# -------------------------
FROM base

# Copy production node_modules and build output
COPY package.json .
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=build /app/dist /app/dist

ENV NODE_PATH=/app/node_modules
ENV NODE_ENV=production
ENV APP_ENVIRONMENT=production

EXPOSE 3000

CMD ["node", "dist/src/main.js"]
