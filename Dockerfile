# Build stage
FROM node:18-alpine as base

# Add necessary build dependencies for bcrypt
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    gcc \
    musl-dev \
    linux-headers \
    eudev-dev

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies and rebuild bcrypt
RUN npm install \
    && npm rebuild bcrypt --build-from-source

# Copy application files
COPY . .

# Expose application port
EXPOSE 4000

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget -qO- http://localhost:4000/health || exit 1

# Start the application
CMD ["npm", "start"]