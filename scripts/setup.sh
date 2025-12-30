#!/bin/bash

# Amal Chat Platform - Quick Setup Script
# This script sets up the development environment

set -e

echo "╔════════════════════════════════════════╗"
echo "║   أمل - Amal Chat Platform Setup      ║"
echo "║   Development Environment              ║"
echo "╚════════════════════════════════════════╝"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version must be 18 or higher. Current: $(node -v)"
    exit 1
fi

echo "✓ Node.js $(node -v) detected"

# Check PostgreSQL
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed."
    echo "   Install with: sudo apt install postgresql-14 postgresql-14-pgvector"
    exit 1
fi

echo "✓ PostgreSQL detected"

# Check Redis
if ! command -v redis-cli &> /dev/null; then
    echo "❌ Redis is not installed."
    echo "   Install with: sudo apt install redis-server"
    exit 1
fi

echo "✓ Redis detected"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Setup environment
if [ ! -f .env ]; then
    echo ""
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "✓ .env file created"
    echo ""
    echo "⚠️  Please edit .env and add your credentials:"
    echo "   - DATABASE_URL"
    echo "   - REDIS_URL"
    echo "   - JWT_SECRET (generate with: node -e \"console.log(require('crypto').randomBytes(64).toString('hex'))\")"
    echo "   - OPENAI_API_KEY"
    echo "   - SMTP credentials"
    echo ""
    read -p "Press Enter after editing .env to continue..."
fi

# Check if database exists
echo ""
echo "🗄️  Checking database..."
DB_NAME="amal_chat"

if psql -lqt | cut -d \| -f 1 | grep -qw $DB_NAME; then
    echo "✓ Database '$DB_NAME' exists"
else
    echo "Creating database '$DB_NAME'..."
    createdb $DB_NAME || {
        echo "❌ Failed to create database. Please create manually:"
        echo "   createdb $DB_NAME"
        exit 1
    }
    echo "✓ Database created"
fi

# Enable pgvector
echo ""
echo "🔌 Enabling pgvector extension..."
psql -d $DB_NAME -c "CREATE EXTENSION IF NOT EXISTS vector;" || {
    echo "❌ Failed to enable pgvector. Please install:"
    echo "   sudo apt install postgresql-14-pgvector"
    exit 1
}
echo "✓ pgvector enabled"

# Run migrations
echo ""
echo "🔄 Running database migrations..."
npm run migrate || {
    echo "❌ Migration failed. Please check your database connection."
    exit 1
}
echo "✓ Migrations completed"

# Check Redis
echo ""
echo "🔴 Checking Redis..."
redis-cli ping > /dev/null 2>&1 || {
    echo "❌ Redis is not running. Start with:"
    echo "   sudo systemctl start redis"
    exit 1
}
echo "✓ Redis is running"

# Build TypeScript
echo ""
echo "🔨 Building TypeScript..."
npm run build:backend || {
    echo "❌ Build failed"
    exit 1
}
echo "✓ Build completed"

# Success
echo ""
echo "╔════════════════════════════════════════╗"
echo "║   ✓ Setup Complete!                    ║"
echo "╚════════════════════════════════════════╝"
echo ""
echo "🚀 Start development server:"
echo "   npm run dev:backend"
echo ""
echo "📚 API Documentation:"
echo "   See API_DOCUMENTATION.md"
echo ""
echo "🧪 Run tests:"
echo "   npm test"
echo ""
echo "🌐 Server will be available at:"
echo "   http://localhost:3000"
echo ""
echo "📊 Health check:"
echo "   curl http://localhost:3000/api/health"
echo ""
