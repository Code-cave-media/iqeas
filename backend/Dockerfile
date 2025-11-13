# Dockerfile (for pure Node, no build)
FROM node:20-alpine AS deps
WORKDIR /app

# copy lockfiles first for caching
COPY package.json package-lock.json ./
RUN npm ci --only=production

FROM node:20-alpine AS runtime
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app

# Copy only production node_modules from deps image
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./

# Copy source
COPY . .

ENV NODE_ENV=production
ENV PORT=8080
USER appuser
EXPOSE 8080

# Adjust start command to your package.json "start" script or entry file
CMD ["npm", "start"]
