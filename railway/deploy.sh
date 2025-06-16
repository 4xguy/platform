#!/bin/bash
# Railway deployment script for Huly Platform

set -e

echo "🚀 Huly Platform Railway Deployment Script"
echo "========================================="

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Check if logged in to Railway
if ! railway whoami &> /dev/null; then
    echo "📝 Please log in to Railway:"
    railway login
fi

# Select deployment type
echo ""
echo "Select deployment type:"
echo "1) Monolithic (all services in one container)"
echo "2) Microservices (separate containers)"
read -p "Choice (1-2): " deployment_type

# Select environment
echo ""
echo "Select environment:"
echo "1) Production"
echo "2) Staging"
echo "3) Development"
read -p "Choice (1-3): " env_choice

case $env_choice in
    1) ENVIRONMENT="production" ;;
    2) ENVIRONMENT="staging" ;;
    3) ENVIRONMENT="development" ;;
    *) echo "Invalid choice"; exit 1 ;;
esac

echo ""
echo "🔧 Deploying to $ENVIRONMENT environment..."

if [ "$deployment_type" == "1" ]; then
    # Monolithic deployment
    echo "📦 Building and deploying monolithic container..."
    
    railway up \
        --service huly-platform \
        --environment $ENVIRONMENT \
        --detach
    
    echo "✅ Monolithic deployment complete!"
    
else
    # Microservices deployment
    echo "📦 Deploying microservices..."
    
    # Deploy frontend
    echo "  → Deploying frontend service..."
    railway up \
        --service huly-frontend \
        --environment $ENVIRONMENT \
        --dockerfile ./railway/Dockerfile.front \
        --detach
    
    # Deploy account service
    echo "  → Deploying account service..."
    railway up \
        --service huly-account \
        --environment $ENVIRONMENT \
        --dockerfile ./railway/Dockerfile.account \
        --detach
    
    # Deploy server/transactor
    echo "  → Deploying server service..."
    railway up \
        --service huly-server \
        --environment $ENVIRONMENT \
        --dockerfile ./railway/Dockerfile.server \
        --detach
    
    echo "✅ Microservices deployment complete!"
fi

# Get deployment URLs
echo ""
echo "🌐 Getting deployment URLs..."
railway status

echo ""
echo "📋 Next steps:"
echo "1. Configure environment variables in Railway dashboard"
echo "2. Set up database services (MongoDB, Redis, MinIO)"
echo "3. Configure custom domains if needed"
echo "4. Check deployment logs: railway logs"

echo ""
echo "✨ Deployment script complete!"