#!/bin/sh
# Startup script for Huly Platform on Railway

echo "Starting Huly Platform services..."

# Start account service in background
cd /app/account
node bundle.js &
ACCOUNT_PID=$!
echo "Account service started with PID $ACCOUNT_PID"

# Wait for account service to be ready
sleep 5

# Start workspace service in background
cd /app/workspace
node bundle.js &
WORKSPACE_PID=$!
echo "Workspace service started with PID $WORKSPACE_PID"

# Start collaborator service in background
cd /app/collaborator
node bundle.js &
COLLAB_PID=$!
echo "Collaborator service started with PID $COLLAB_PID"

# Start transactor/server as main process
cd /app/server
echo "Starting main transactor service..."
exec node bundle.js