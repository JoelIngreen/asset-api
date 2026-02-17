FROM node:20-alpine

WORKDIR /app

# Copy package files and prisma schema
COPY package*.json ./
COPY prisma ./prisma/

# Install ALL dependencies (including dev dependencies needed for build)
RUN npm ci

# Generate Prisma Client
RUN npx prisma generate

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Remove dev dependencies after build
RUN npm prune --production

# Crear directorio de storage
RUN mkdir -p /app/storage

EXPOSE 20000

# Run migrations and start app
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]