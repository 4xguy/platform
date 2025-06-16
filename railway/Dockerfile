# Railway deployment Dockerfile for Huly Platform
# This builds a single container with all essential services

FROM node:20.11.0-alpine as builder

# Install build dependencies
RUN apk add --no-cache python3 make g++ git openssh-client

# Install Rush globally
RUN npm install -g @microsoft/rush pnpm@9.15.3

WORKDIR /app

# Copy rush configuration files first
COPY rush.json .
COPY common/config/rush common/config/rush

# Copy all files including .gitmodules
COPY . .

# Initialize and update git submodules
RUN git init && \
    git config --global --add safe.directory /app && \
    if [ -f .gitmodules ]; then \
        git submodule init && \
        git submodule update --init --recursive || true; \
    fi

# Copy the script to remove communication packages
COPY railway/remove-communication.js ./railway/

# Remove packages that depend on the communication submodule if it's not available
RUN if [ ! -d "communication" ] || [ -z "$(ls -A communication 2>/dev/null)" ]; then \
        echo "Communication submodule not found or empty, removing from rush.json" && \
        node ./railway/remove-communication.js \
    ; fi

# Install dependencies
RUN rush install

# Build all packages
RUN rush build && rush bundle && rush package

# Production stage
FROM node:20.11.0-alpine

RUN apk add --no-cache ca-certificates

WORKDIR /app

# Copy built bundles from builder
COPY --from=builder /app/pods/server/bundle ./server/
COPY --from=builder /app/pods/front/dist ./front/
COPY --from=builder /app/pods/account/bundle ./account/
COPY --from=builder /app/pods/workspace/bundle ./workspace/
COPY --from=builder /app/pods/collaborator/bundle ./collaborator/
COPY --from=builder /app/models/all/bundle/model.json ./model.json

# Copy startup script
COPY railway/start.sh ./start.sh
RUN chmod +x ./start.sh

# Expose ports
EXPOSE 8080 3000 3333 3078

# Start services
CMD ["./start.sh"]