# Local Development Setup Script
# Run this script to start the application locally

# Set environment variables for local development
$env:NODE_ENV="development"
$env:PORT="5000"
$env:DATABASE_URL="postgresql://localhost:5432/bookwormhub_local"
$env:SESSION_SECRET="local-dev-secret-key"

# Install dependencies if needed
if (!(Test-Path "node_modules")) {
    Write-Host "Installing dependencies..."
    npm install
}

# Start the development server
Write-Host "Starting BookWormHub in development mode..."
Write-Host "Application will be available at: http://localhost:5000"
npm run dev
