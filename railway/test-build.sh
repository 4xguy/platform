#!/bin/bash
# Test Railway Docker builds locally

set -e

echo "🔧 Testing Railway Docker builds locally..."
echo "========================================="

# Check if we're in the right directory
if [ ! -f "rush.json" ]; then
    echo "❌ Error: Must run from the platform root directory"
    exit 1
fi

# Select which Dockerfile to test
echo ""
echo "Select Dockerfile to test:"
echo "1) Simplified (excludes communication) - RECOMMENDED"
echo "2) Original (requires submodule)"
echo "3) Frontend only"
echo "4) Server only"
echo "5) Account only"
read -p "Choice (1-5): " choice

case $choice in
    1) DOCKERFILE="railway/Dockerfile.simple" ;;
    2) DOCKERFILE="railway/Dockerfile" ;;
    3) DOCKERFILE="railway/Dockerfile.front" ;;
    4) DOCKERFILE="railway/Dockerfile.server" ;;
    5) DOCKERFILE="railway/Dockerfile.account" ;;
    *) echo "Invalid choice"; exit 1 ;;
esac

echo ""
echo "📦 Building with $DOCKERFILE..."

# Build the Docker image
docker build -f $DOCKERFILE -t huly-railway-test:latest . || {
    echo ""
    echo "❌ Build failed!"
    echo ""
    echo "Common issues:"
    echo "1. If you see communication submodule errors, use option 1 (simplified)"
    echo "2. Make sure you have Docker running"
    echo "3. Check that you're in the platform root directory"
    exit 1
}

echo ""
echo "✅ Build successful!"
echo ""
echo "To run the container:"
echo "docker run -p 8080:8080 -p 3000:3000 -p 3333:3333 huly-railway-test:latest"
echo ""
echo "Or use docker-compose for a complete test environment:"
echo "cd railway && docker-compose -f docker-compose.test.yml up"