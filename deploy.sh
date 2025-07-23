#!/bin/bash
set -e

echo "🚀 Starting deployment process..."

# Function to check if docker compose command exists and use appropriate version
check_docker_compose() {
    if command -v docker-compose &> /dev/null; then
        echo "docker-compose"
    else
        echo "docker compose"
    fi
}

DOCKER_COMPOSE=$(check_docker_compose)

# Load from BOTH env files to get all variables - PROPERLY handle quotes
echo "📦 Loading environment variables..."
if [ -f .env ]; then
    set -a
    source .env
    set +a
fi
if [ -f .env.docker ]; then
    set -a
    source .env.docker
    set +a
fi
if [ -f .env.local ]; then
    set -a
    source .env.local  
    set +a
fi

# Build new images
echo "🏗️  Building new images..."
$DOCKER_COMPOSE build --no-cache

# Recreate containers
echo "🔄 Swapping to new containers..."
$DOCKER_COMPOSE up -d --force-recreate

echo "📢 Deployment complete!"