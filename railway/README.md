# Railway Deployment for Huly Platform

This directory contains all the necessary files to deploy the Huly Platform to Railway.com.

⚠️ **Important Note**: The Huly Platform uses private packages hosted on GitHub's npm registry. 
Railway deployments require authentication to access these packages. See [DEPLOY-SIMPLE.md](./DEPLOY-SIMPLE.md) 
for alternative approaches if you don't have access to these private packages.

## Quick Start

1. **Fork this repository** to your GitHub account

2. **Sign up for Railway** at [railway.app](https://railway.app)

3. **Deploy with one click:**
   
   [![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https://github.com/YOUR_USERNAME/platform)

4. **Configure environment variables** using the template in `.env.template`

## Files Overview

- `railway.json` - Main Railway configuration
- `Dockerfile` - Monolithic deployment (all services in one container)
- `Dockerfile.simple` - Simplified deployment without communication submodule
- `Dockerfile.front` - Frontend service only
- `Dockerfile.server` - Backend/API service only
- `Dockerfile.account` - Account service only
- `rush-clean.json` - Pre-cleaned rush.json without comments and communication packages
- `.env.template` - Environment variables template
- `deploy.sh` - Local deployment script
- `DEPLOY.md` - Detailed deployment guide

## Deployment Options

### Option 1: Monolithic (Recommended for Getting Started)
```bash
railway up
```

### Option 2: Microservices
```bash
./deploy.sh
```

## Local Testing

Test the Railway deployment locally:

```bash
cd railway
docker-compose -f docker-compose.test.yml up
```

## Required Services

The platform requires:
- MongoDB or PostgreSQL
- Redis
- MinIO (S3-compatible storage)

Railway provides plugins for MongoDB and Redis. For MinIO, use the community template.

## Environment Variables

Critical variables to set:
- `SERVER_SECRET` - Strong secret key
- `MONGO_URL` - MongoDB connection string
- `REDIS_URL` - Redis connection string
- `STORAGE_CONFIG` - MinIO configuration
- `PLATFORM_ADMIN_EMAILS` - Admin email addresses

See `.env.template` for the complete list.

## Support

- [Deployment Guide](./DEPLOY.md)
- [Railway Documentation](https://docs.railway.app)
- [Huly Platform Issues](https://github.com/hcengineering/platform/issues)

## CI/CD

GitHub Actions workflow is included for automated deployments. Add `RAILWAY_TOKEN` to your repository secrets.