# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Huly Platform is a robust framework for building business applications (CRM, HRM, ATS, etc.) with a microservices architecture. The codebase is a large TypeScript monorepo managed with Rush, containing 200+ packages.

## Essential Commands

### Development Setup
```bash
# Initial setup
npm login --registry=https://npm.pkg.github.com  # Requires GitHub token with read:packages scope
rush install
rush build

# Fast start (runs all setup steps)
sh ./scripts/fast-start.sh
```

### Build Commands
```bash
rush build          # Incremental build
rush rebuild        # Clean rebuild
rush build:watch    # Build with file watching
rush bundle         # Create production bundles
rush package        # Package applications
rush validate       # TypeScript validation
```

### Development Mode
```bash
cd dev/prod
rush validate
rushx dev-server    # Start dev server at localhost:8080
```

### Testing
```bash
rush test           # Run all tests
rushx test          # Run tests in current package
rush retest         # Run tests without cache

# UI tests
cd ./tests
./create-local.sh   # Setup test environment
cd ./sanity
rushx dev-uitest    # Run UI tests against dev environment
```

### Code Quality
```bash
rush format         # Format all code
rush fast-format    # Format only changed files
rush svelte-check   # Validate Svelte components
rush lint           # Run linting (where configured)
```

### Docker Development
```bash
cd ./dev/
rush docker:build   # Build all Docker containers
rush docker:up      # Start development environment
# Access at http://huly.local:8087 (add to /etc/hosts)
```

## Architecture

### Directory Structure
- `/packages/` - Core shared libraries and utilities
- `/plugins/` - Feature plugins (CRM, HRM, chat, calendar)
- `/models/` - Data models and schemas
- `/server/` - Backend services
- `/server-plugins/` - Server-side plugin implementations
- `/services/` - Microservices (GitHub, mail, calendar integrations)
- `/pods/` - Containerized deployments
- `/tests/` - Test infrastructure
- `/dev/` - Development configurations

### Technology Stack
- **Frontend**: Svelte 4, TypeScript
- **Backend**: Node.js (v20.11.0), TypeScript
- **Build**: Rush monorepo, pnpm (v9.15.3)
- **Data**: MongoDB/CockroachDB, Elasticsearch, MinIO
- **Messaging**: Redpanda (Kafka)

### Key Services
- `transactor` - Main transaction processing
- `collaborator` - Real-time collaboration
- `fulltext` - Search functionality
- `account` - User management
- `front` - Frontend server

## Development Guidelines

### Plugin Architecture
The platform uses a plugin-based architecture. Each plugin contains:
- Model definitions in `/models/`
- Frontend UI in `/plugins/`
- Backend logic in `/server-plugins/`

### Package Conventions
- All packages use TypeScript
- Each package has standard scripts: `build`, `test`, `format`
- Dependencies managed through Rush's centralized version management
- Use existing utilities from `@hcengineering/platform` packages

### Testing Approach
- Unit tests: Use Jest, run with `rushx test` in package directory
- UI tests: Playwright-based, located in `/tests/sanity/`
- Test single file: Use appropriate test runner with file path

### Common Development Tasks
```bash
# After structure changes
rush update
rush build

# Clear build cache if needed
rm -rf common/temp/build-cache

# Version bump for publishing
node ./common/scripts/bump.js -p packageName
```