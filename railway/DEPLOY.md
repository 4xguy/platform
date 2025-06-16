# Deploying Huly Platform to Railway

This guide provides step-by-step instructions for deploying the Huly Platform to Railway.com.

## Prerequisites

- Railway account (sign up at [railway.app](https://railway.app))
- GitHub account with access to your forked Huly Platform repository
- Basic understanding of environment variables and microservices

## Deployment Options

We provide two deployment strategies:

### Option 1: Monolithic Deployment (Recommended for Getting Started)

Deploy all services in a single container. This is simpler but less scalable.

### Option 2: Microservices Deployment

Deploy each service separately for better scalability and resource management.

## Quick Start: Monolithic Deployment

### Step 1: Create Railway Project

1. Log in to Railway
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Connect your GitHub account if not already connected
5. Select your Huly Platform repository

### Step 2: Configure Services

Railway will automatically detect the `railway.json` file. You'll need to add these services:

#### Add MongoDB
1. Click "New" → "Database" → "Add MongoDB"
2. Note the `MONGO_URL` variable that's created

#### Add Redis
1. Click "New" → "Database" → "Add Redis"
2. Note the `REDIS_URL` variable that's created

#### Add MinIO (Object Storage)
1. Click "New" → "Template" → Search for "MinIO"
2. Deploy MinIO template
3. Configure with:
   - `MINIO_ROOT_USER`: minioadmin
   - `MINIO_ROOT_PASSWORD`: [secure password]

### Step 3: Configure Environment Variables

1. Click on your main service
2. Go to "Variables" tab
3. Add the following variables (use the template from `railway/.env.template`):

```env
NODE_ENV=production
SERVER_SECRET=your-very-secure-secret-key
MONGO_URL=${{MongoDB.MONGO_URL}}
DB_URL=${{MongoDB.MONGO_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
QUEUE_CONFIG=redis://${{Redis.REDIS_URL}}
STORAGE_CONFIG=minio|huly-files|${{MinIO.RAILWAY_PRIVATE_DOMAIN}}:9000|minioadmin|your-minio-password
FRONT_URL=https://${{RAILWAY_PUBLIC_DOMAIN}}
ACCOUNTS_URL=http://localhost:3000
TRANSACTOR_URL=ws://localhost:3333
COLLABORATOR_URL=ws://localhost:3078
PLATFORM_ADMIN_EMAILS=admin@yourdomain.com
```

### Step 4: Deploy

1. Railway will automatically build and deploy your application
2. Monitor the build logs for any errors
3. Once deployed, click on the service to get your public URL

### Step 5: Initial Setup

1. Visit your deployment URL
2. Click "Sign up" and create the first admin account using the email specified in `PLATFORM_ADMIN_EMAILS`
3. Create your first workspace

## Advanced: Microservices Deployment

For production deployments, deploy each service separately:

### 1. Create Services

Create a new Railway service for each component:

- **Frontend** (`railway/Dockerfile.front`)
- **Account Service** (`railway/Dockerfile.account`)
- **Transactor/Server** (`railway/Dockerfile.server`)
- **Collaborator** (create similar Dockerfile)
- **Workspace** (create similar Dockerfile)

### 2. Configure Internal Networking

Use Railway's internal networking for service communication:

```env
ACCOUNTS_URL=http://account.railway.internal:3000
TRANSACTOR_URL=ws://server.railway.internal:3333
COLLABORATOR_URL=ws://collaborator.railway.internal:3078
```

### 3. Service-Specific Configuration

Each service needs specific environment variables. For example:

#### Frontend Service
```env
SERVER_PORT=80
ACCOUNTS_URL=${{account.RAILWAY_PRIVATE_DOMAIN}}:3000
TRANSACTOR_URL=wss://${{server.RAILWAY_PUBLIC_DOMAIN}}
```

#### Account Service
```env
ACCOUNT_PORT=3000
DB_URL=${{MongoDB.MONGO_URL}}
SERVER_SECRET=${{shared.SERVER_SECRET}}
```

## Post-Deployment Configuration

### 1. Configure Custom Domain

1. Go to service settings
2. Add your custom domain
3. Update DNS records as instructed

### 2. Set Up Backups

Configure automated backups for MongoDB:

```env
BACKUP_STORAGE=minio|backups|endpoint|key|secret
BACKUP_BUCKET_NAME=huly-backups
```

### 3. Enable Additional Services

To enable optional services like GitHub integration or AI bot:

1. Deploy the service using its Dockerfile
2. Add required environment variables
3. Update main service URLs to point to new services

## Monitoring and Maintenance

### Health Checks

The platform includes health check endpoints:
- Main API: `/api/_health`
- Account service: `/health`

### Logs

View logs in Railway dashboard or use Railway CLI:
```bash
railway logs
```

### Scaling

To scale services:
1. Go to service settings
2. Adjust "Replicas" count
3. Configure auto-scaling rules if needed

## Troubleshooting

### Common Issues

1. **Build fails with Rush errors**
   - Ensure Node.js version 20.11.0 is used
   - Check GitHub token for package access

2. **Services can't communicate**
   - Verify internal URLs use `.railway.internal` domain
   - Check environment variables are properly set

3. **File uploads fail**
   - Verify MinIO configuration
   - Check storage permissions

### Debug Mode

Enable debug logging:
```env
DEBUG=*
METRICS_CONSOLE=true
```

## Security Considerations

1. **Always use strong secrets** for `SERVER_SECRET`
2. **Enable HTTPS** (Railway provides this automatically)
3. **Restrict signup** if needed: `DISABLE_SIGNUP=true`
4. **Regular backups** of MongoDB data
5. **Monitor logs** for suspicious activity

## Support

- Railway documentation: [docs.railway.app](https://docs.railway.app)
- Huly Platform issues: [GitHub Issues](https://github.com/hcengineering/platform/issues)
- Community support: [Huly Discord/Forum]

## Next Steps

1. Configure email service for notifications
2. Set up monitoring and alerting
3. Implement backup strategy
4. Configure CI/CD pipeline
5. Performance optimization