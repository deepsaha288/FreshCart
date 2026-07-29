# Stage 1: Build stage
FROM node:18-alpine AS builder
WORKDIR /app

# Install dependencies first for better caching
COPY package*.json ./
RUN npm ci

# Copy the rest of the application files and build
COPY . .
RUN npm run build

# Stage 2: Production runner stage
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy only runtime dependencies and build artifacts from build stage
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
# COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./

EXPOSE 3000

# Start Next.js server
CMD ["npm", "run", "start"]
