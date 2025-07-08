# Yemen Construction Management Platform - Environment Setup
*Complete Development & Production Environment Configuration*

## Overview

This guide provides comprehensive setup instructions for development, staging, and production environments of the Yemen Construction Management Platform, including all dependencies, configurations, and deployment procedures.

---

## Prerequisites

### System Requirements
- **Node.js**: 18.x or higher
- **npm**: 9.x or higher
- **PostgreSQL**: 14.x or higher
- **Git**: Latest version
- **OS**: Linux/macOS/Windows 10+

### Development Tools
- **IDE**: VS Code with recommended extensions
- **Browser**: Chrome/Firefox with dev tools
- **API Testing**: Postman or Insomnia
- **Database Client**: pgAdmin, TablePlus, or DBeaver

---

## Local Development Environment

### 1. Repository Setup
```bash
# Clone the repository
git clone <repository-url>
cd yemen-construction-platform

# Install dependencies
npm install

# Verify installation
npm run check-env
```

### 2. Environment Configuration
Create environment files for different stages:

#### `.env.development`
```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/yemen_construction_dev
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=yemen_dev_user
POSTGRES_PASSWORD=dev_password_123
POSTGRES_DB=yemen_construction_dev

# Server Configuration
NODE_ENV=development
PORT=5000
HOST=0.0.0.0

# Authentication
JWT_SECRET=your_super_secret_jwt_key_for_development
JWT_REFRESH_SECRET=your_refresh_secret_key_for_development
JWT_EXPIRE=8h
JWT_REFRESH_EXPIRE=30d

# Security
CORS_ORIGIN=http://localhost:5173,http://localhost:5000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
UPLOAD_MAX_SIZE=10485760
UPLOAD_ALLOWED_TYPES=pdf,doc,docx,xls,xlsx,jpg,jpeg,png,gif

# Business Intelligence
YEMEN_MARKET_RATES_API=http://localhost:5000/api/market-rates
CURRENCY_EXCHANGE_API=https://api.exchangerate-api.com/v4/latest/YER

# PWA Configuration
PWA_CACHE_VERSION=v1.0.0
PWA_CACHE_DURATION=86400000

# Development Flags
DEBUG_MODE=true
VERBOSE_LOGGING=true
ENABLE_SEED_DATA=true
```

#### `.env.production`
```env
# Database Configuration (Neon/Production)
DATABASE_URL=postgresql://user:password@host:5432/yemen_construction_prod
POSTGRES_SSL=true

# Server Configuration
NODE_ENV=production
PORT=5000
HOST=0.0.0.0

# Authentication (Use strong secrets in production)
JWT_SECRET=${JWT_SECRET}
JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
JWT_EXPIRE=8h
JWT_REFRESH_EXPIRE=30d

# Security
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=50

# File Upload
UPLOAD_MAX_SIZE=10485760
UPLOAD_PATH=/var/www/uploads
UPLOAD_ALLOWED_TYPES=pdf,doc,docx,xls,xlsx,jpg,jpeg,png

# External Services
YEMEN_MARKET_RATES_API=https://api.yemenrates.com/v1
CURRENCY_EXCHANGE_API=https://api.exchangerate-api.com/v4/latest/YER

# PWA Configuration
PWA_CACHE_VERSION=v1.0.0
PWA_CACHE_DURATION=86400000

# Production Flags
DEBUG_MODE=false
VERBOSE_LOGGING=false
ENABLE_SEED_DATA=false
```

### 3. Database Setup

#### Local PostgreSQL Installation
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# macOS (Homebrew)
brew install postgresql
brew services start postgresql

# Windows
# Download from https://www.postgresql.org/download/windows/
```

#### Database Configuration
```bash
# Access PostgreSQL
sudo -u postgres psql

# Create database and user
CREATE DATABASE yemen_construction_dev;
CREATE USER yemen_dev_user WITH PASSWORD 'dev_password_123';
GRANT ALL PRIVILEGES ON DATABASE yemen_construction_dev TO yemen_dev_user;

# Enable extensions
\c yemen_construction_dev;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

\q
```

#### Schema Migration
```bash
# Generate initial migration
npm run db:generate

# Push schema to database
npm run db:push

# Seed development data
npm run db:seed
```

### 4. VS Code Configuration

#### Recommended Extensions
```json
// .vscode/extensions.json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-typescript.vscode-typescript-next",
    "ms-vscode.vscode-typescript-next",
    "drizzle-team.drizzle-vscode",
    "ms-vscode.vscode-json",
    "christian-kohler.path-intellisense",
    "formulahendry.auto-rename-tag",
    "ms-vscode.vscode-eslint",
    "ms-vscode.vscode-jest",
    "ms-playwright.playwright"
  ]
}
```

#### Workspace Settings
```json
// .vscode/settings.json
{
  "typescript.preferences.includePackageJsonAutoImports": "auto",
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "files.associations": {
    "*.css": "tailwindcss"
  },
  "tailwindCSS.includeLanguages": {
    "typescript": "javascript",
    "typescriptreact": "javascript"
  },
  "eslint.workingDirectories": ["client", "server"],
  "jest.jestCommandLine": "npm run test",
  "playwright.reuseBrowser": true,
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  }
}
```

### 5. Package Scripts Configuration

#### `package.json` Scripts
```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:server\" \"npm run dev:client\"",
    "dev:server": "tsx watch server/index.ts",
    "dev:client": "vite",
    "build": "npm run build:client && npm run build:server",
    "build:client": "vite build",
    "build:server": "tsc --project tsconfig.server.json",
    "start": "node dist/server/index.js",
    "preview": "vite preview",
    
    "db:generate": "drizzle-kit generate:pg",
    "db:push": "drizzle-kit push:pg",
    "db:push:test": "DATABASE_URL=$DATABASE_TEST_URL drizzle-kit push:pg",
    "db:studio": "drizzle-kit studio",
    "db:seed": "tsx scripts/seed-database.ts",
    "db:reset": "tsx scripts/reset-database.ts",
    
    "test": "vitest",
    "test:unit": "vitest run --reporter=verbose --coverage",
    "test:integration": "vitest run tests/integration",
    "test:e2e": "playwright test",
    "test:performance": "artillery run tests/performance/load-test.yml",
    "test:coverage": "vitest run --coverage",
    "test:watch": "vitest watch",
    
    "lint": "eslint . --ext .ts,.tsx,.js,.jsx",
    "lint:fix": "eslint . --ext .ts,.tsx,.js,.jsx --fix",
    "type-check": "tsc --noEmit",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    
    "check-env": "tsx scripts/check-environment.ts",
    "setup:dev": "tsx scripts/setup-development.ts",
    "setup:prod": "tsx scripts/setup-production.ts"
  }
}
```

---

## Production Environment Setup

### 1. Server Requirements

#### Minimum Specifications
- **CPU**: 2 vCPUs
- **RAM**: 4GB
- **Storage**: 50GB SSD
- **Network**: 100 Mbps
- **OS**: Ubuntu 20.04 LTS or CentOS 8

#### Recommended Specifications
- **CPU**: 4 vCPUs
- **RAM**: 8GB
- **Storage**: 100GB SSD
- **Network**: 1 Gbps
- **OS**: Ubuntu 22.04 LTS

### 2. Production Dependencies

#### System Packages
```bash
# Ubuntu/Debian
sudo apt update
sudo apt upgrade -y
sudo apt install -y curl wget git build-essential

# Install Node.js via NodeSource
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx as reverse proxy
sudo apt install -y nginx

# Install PostgreSQL client
sudo apt install -y postgresql-client

# Install Certbot for SSL
sudo apt install -y certbot python3-certbot-nginx
```

### 3. Application Deployment

#### Deployment Script
```bash
#!/bin/bash
# deploy.sh

set -e

echo "🚀 Deploying Yemen Construction Management Platform..."

# Variables
APP_DIR="/var/www/yemen-construction"
REPO_URL="https://github.com/your-username/yemen-construction-platform.git"
BRANCH="main"

# Create application directory
sudo mkdir -p $APP_DIR
sudo chown -R $USER:$USER $APP_DIR

# Clone or update repository
if [ -d "$APP_DIR/.git" ]; then
    echo "📦 Updating existing repository..."
    cd $APP_DIR
    git fetch origin
    git reset --hard origin/$BRANCH
else
    echo "📦 Cloning repository..."
    git clone -b $BRANCH $REPO_URL $APP_DIR
    cd $APP_DIR
fi

# Install dependencies
echo "📚 Installing dependencies..."
npm ci --only=production

# Build application
echo "🔨 Building application..."
npm run build

# Set up environment
echo "⚙️ Setting up environment..."
if [ ! -f ".env.production" ]; then
    echo "❌ .env.production file not found!"
    exit 1
fi

# Database migration
echo "🗄️ Running database migrations..."
npm run db:push

# Restart PM2 processes
echo "🔄 Restarting services..."
pm2 restart ecosystem.config.js --env production

# Update Nginx configuration
echo "🌐 Updating Nginx configuration..."
sudo cp configs/nginx.conf /etc/nginx/sites-available/yemen-construction
sudo ln -sf /etc/nginx/sites-available/yemen-construction /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

echo "✅ Deployment completed successfully!"
```

### 4. PM2 Configuration

#### `ecosystem.config.js`
```javascript
module.exports = {
  apps: [
    {
      name: 'yemen-construction',
      script: 'dist/server/index.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'development',
        PORT: 5000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: '/var/log/yemen-construction/error.log',
      out_file: '/var/log/yemen-construction/out.log',
      log_file: '/var/log/yemen-construction/combined.log',
      time: true,
      watch: false,
      max_memory_restart: '1G',
      min_uptime: '10s',
      max_restarts: 10,
      autorestart: true,
      restart_delay: 4000
    }
  ]
};
```

### 5. Nginx Configuration

#### `/etc/nginx/sites-available/yemen-construction`
```nginx
# Rate limiting
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;

# Upstream Node.js servers
upstream nodejs_backend {
    least_conn;
    server 127.0.0.1:5000 max_fails=3 fail_timeout=30s;
    keepalive 32;
}

# HTTP to HTTPS redirect
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_stapling on;
    ssl_stapling_verify on;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml;

    # Root directory for static files
    root /var/www/yemen-construction/dist/client;
    index index.html;

    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # API routes with rate limiting
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        
        proxy_pass http://nodejs_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 90;
    }

    # Special rate limiting for login endpoint
    location /api/auth/login {
        limit_req zone=login burst=5 nodelay;
        
        proxy_pass http://nodejs_backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # File uploads
    location /api/files/upload {
        client_max_body_size 10M;
        proxy_pass http://nodejs_backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300;
    }

    # SPA routing - serve index.html for all non-API routes
    location / {
        try_files $uri $uri/ /index.html;
        
        # Arabic font preloading
        location ~* \.(woff2|woff)$ {
            add_header Access-Control-Allow-Origin "*";
            expires 1y;
        }
    }

    # Security - hide sensitive files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }

    location ~ ~$ {
        deny all;
        access_log off;
        log_not_found off;
    }
}
```

---

## Database Setup (Production)

### 1. Neon Database Configuration
```bash
# Environment variables for Neon
export DATABASE_URL="postgresql://username:password@ep-hostname.region.neon.tech/dbname?sslmode=require"
export PGPASSWORD="your_password"

# Test connection
npx drizzle-kit introspect:pg --connectionString=$DATABASE_URL
```

### 2. Database Security
```sql
-- Create read-only user for reporting
CREATE USER yemen_readonly WITH PASSWORD 'readonly_secure_password';
GRANT CONNECT ON DATABASE yemen_construction_prod TO yemen_readonly;
GRANT USAGE ON SCHEMA public TO yemen_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO yemen_readonly;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO yemen_readonly;

-- Create backup user
CREATE USER yemen_backup WITH PASSWORD 'backup_secure_password';
GRANT CONNECT ON DATABASE yemen_construction_prod TO yemen_backup;
GRANT USAGE ON SCHEMA public TO yemen_backup;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO yemen_backup;
```

### 3. Backup Strategy
```bash
#!/bin/bash
# backup-database.sh

BACKUP_DIR="/var/backups/yemen-construction"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="yemen_construction_prod"
BACKUP_FILE="$BACKUP_DIR/${DB_NAME}_${DATE}.sql"

# Create backup directory
mkdir -p $BACKUP_DIR

# Create database backup
pg_dump $DATABASE_URL > $BACKUP_FILE

# Compress backup
gzip $BACKUP_FILE

# Remove backups older than 30 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "Database backup completed: ${BACKUP_FILE}.gz"

# Upload to cloud storage (optional)
# aws s3 cp ${BACKUP_FILE}.gz s3://your-backup-bucket/database/
```

---

## Monitoring and Logging

### 1. Application Monitoring
```bash
# Install monitoring tools
sudo npm install -g pm2
pm2 install pm2-logrotate

# Configure log rotation
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
pm2 set pm2-logrotate:compress true
```

### 2. System Monitoring
```bash
# Install htop for system monitoring
sudo apt install htop

# Install ncdu for disk usage
sudo apt install ncdu

# Monitor disk space
df -h

# Monitor memory usage
free -h

# Monitor active connections
netstat -tulpn | grep :5000
```

### 3. Log Management
```javascript
// logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'yemen-construction' },
  transports: [
    new winston.transports.File({ 
      filename: '/var/log/yemen-construction/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: '/var/log/yemen-construction/combined.log' 
    }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

module.exports = logger;
```

---

## SSL Certificate Setup

### 1. Let's Encrypt with Certbot
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test automatic renewal
sudo certbot renew --dry-run

# Set up automatic renewal cron job
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
```

---

## Security Hardening

### 1. Firewall Configuration
```bash
# Configure UFW (Uncomplicated Firewall)
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### 2. Fail2Ban Setup
```bash
# Install Fail2Ban
sudo apt install fail2ban

# Configure Fail2Ban
sudo tee /etc/fail2ban/jail.local <<EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[nginx-http-auth]
enabled = true

[nginx-limit-req]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log

[sshd]
enabled = true
port = ssh
logpath = /var/log/auth.log
maxretry = 3
bantime = 86400
EOF

# Start Fail2Ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

---

## Performance Optimization

### 1. Node.js Optimization
```javascript
// server/index.ts performance configurations
import compression from 'compression';
import helmet from 'helmet';

app.use(compression());
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Enable keep-alive
app.use((req, res, next) => {
  res.setHeader('Connection', 'keep-alive');
  next();
});
```

### 2. Database Connection Pooling
```typescript
// server/db.ts
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20, // Maximum number of connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export { pool };
```

---

This comprehensive environment setup guide ensures robust, secure, and scalable deployment of the Yemen Construction Management Platform across all environments.