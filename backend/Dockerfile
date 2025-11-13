# Dockerfile (production, multi-stage)
FROM node:20-alpine AS build
WORKDIR /app

# Install build deps first (lockfiles help caching)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and run build (if you have a build step)
COPY . .
# If you use TypeScript or a bundler, ensure package.json has "build" script
RUN npm run build --if-present

FROM node:20-alpine AS runtime
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy only production deps and built output
COPY --from=build /app/package.json /app/package-lock.json ./
RUN npm ci --only=production

# Copy built artifacts (or source if no build)
COPY --from=build /app/dist ./dist
# Fallback if your app doesn't build:
# COPY --from=build /app/src ./src
# COPY --from=build /app/public ./public

ENV NODE_ENV=production
ENV PORT=8080

USER appuser
EXPOSE 8080
ENTRYPOINT ["node", "dist/index.js"]  # adjust path to your start file
