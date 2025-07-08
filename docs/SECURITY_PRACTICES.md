# Yemen Construction Management Platform - Security Practices
*Comprehensive Security Framework for Production Deployment*

## Overview

This document outlines the complete security framework for the Yemen Construction Management Platform, covering authentication, authorization, data protection, compliance, and threat mitigation strategies.

**Security Philosophy**: Defense-in-depth approach with multiple security layers, zero-trust architecture, and proactive threat monitoring.

---

## Authentication & Authorization

### 1. JWT Authentication Implementation

#### Token Structure
```typescript
interface JWTPayload {
  userId: number;
  username: string;
  role: 'ceo' | 'manager' | 'supervisor' | 'employee' | 'worker';
  companyId: number;
  permissions: string[];
  iat: number; // Issued at
  exp: number; // Expiration
  jti: string; // JWT ID for revocation
}

interface RefreshTokenPayload {
  userId: number;
  tokenFamily: string; // For refresh token rotation
  iat: number;
  exp: number;
}
```

#### Secure Token Generation
```typescript
// server/auth/jwt.ts
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export class SecureJWTService {
  private static readonly ACCESS_TOKEN_EXPIRE = '15m';
  private static readonly REFRESH_TOKEN_EXPIRE = '7d';
  
  static generateTokenPair(user: User): TokenPair {
    const jti = crypto.randomUUID();
    const tokenFamily = crypto.randomUUID();
    
    const accessToken = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        role: user.role,
        companyId: user.companyId,
        permissions: this.getUserPermissions(user.role),
        jti
      },
      process.env.JWT_SECRET!,
      { 
        expiresIn: this.ACCESS_TOKEN_EXPIRE,
        issuer: 'yemen-construction-platform',
        audience: 'construction-users'
      }
    );
    
    const refreshToken = jwt.sign(
      {
        userId: user.id,
        tokenFamily,
        jti
      },
      process.env.JWT_REFRESH_SECRET!,
      { 
        expiresIn: this.REFRESH_TOKEN_EXPIRE,
        issuer: 'yemen-construction-platform'
      }
    );
    
    return { accessToken, refreshToken, expiresIn: 900 }; // 15 minutes
  }
  
  static getUserPermissions(role: string): string[] {
    const permissions: Record<string, string[]> = {
      ceo: [
        'company:read', 'company:write', 'company:delete',
        'project:read', 'project:write', 'project:delete',
        'user:read', 'user:write', 'user:delete',
        'financial:read', 'financial:write',
        'reports:read', 'reports:write'
      ],
      manager: [
        'project:read', 'project:write',
        'user:read', 'user:write',
        'financial:read', 'financial:write',
        'reports:read'
      ],
      supervisor: [
        'project:read', 'project:write',
        'user:read',
        'equipment:read', 'equipment:write',
        'reports:read'
      ],
      employee: [
        'project:read',
        'user:read',
        'equipment:read'
      ],
      worker: [
        'project:read',
        'equipment:read'
      ]
    };
    
    return permissions[role] || [];
  }
}
```

### 2. Multi-Factor Authentication (MFA)

#### SMS-Based MFA Implementation
```typescript
// server/auth/mfa.ts
import crypto from 'crypto';
import { db } from '../db';

export class MFAService {
  static async generateMFACode(userId: number): Promise<string> {
    const code = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    
    await db.insert(mfaCodes).values({
      userId,
      code: await this.hashCode(code),
      expiresAt,
      attempts: 0
    });
    
    return code;
  }
  
  static async verifyMFACode(userId: number, inputCode: string): Promise<boolean> {
    const record = await db.query.mfaCodes.findFirst({
      where: (codes, { eq, and, gt }) => and(
        eq(codes.userId, userId),
        gt(codes.expiresAt, new Date()),
        eq(codes.used, false)
      )
    });
    
    if (!record || record.attempts >= 3) {
      return false;
    }
    
    const isValid = await this.compareCode(inputCode, record.code);
    
    if (isValid) {
      await db.update(mfaCodes)
        .set({ used: true })
        .where(eq(mfaCodes.id, record.id));
      return true;
    } else {
      await db.update(mfaCodes)
        .set({ attempts: record.attempts + 1 })
        .where(eq(mfaCodes.id, record.id));
      return false;
    }
  }
  
  private static async hashCode(code: string): Promise<string> {
    return bcrypt.hash(code, 12);
  }
  
  private static async compareCode(code: string, hash: string): Promise<boolean> {
    return bcrypt.compare(code, hash);
  }
}
```

### 3. Role-Based Access Control (RBAC)

#### Permission Middleware
```typescript
// server/middleware/rbac.ts
export function requirePermission(permission: string) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (!user.permissions.includes(permission)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: permission,
        userRole: user.role
      });
    }
    
    next();
  };
}

// Usage in routes
app.get('/api/financial/reports', 
  authenticateToken,
  requirePermission('financial:read'),
  getFinancialReports
);

app.post('/api/projects',
  authenticateToken,
  requirePermission('project:write'),
  createProject
);
```

#### Company-Level Data Isolation
```typescript
// server/middleware/company-isolation.ts
export function enforceCompanyIsolation() {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // Add company filter to all database queries
    req.companyFilter = { companyId: req.user.companyId };
    next();
  };
}

// Enhanced query helper
export function withCompanyFilter<T>(
  query: SelectQueryBuilder<T>, 
  req: AuthenticatedRequest
): SelectQueryBuilder<T> {
  return query.where(eq(projects.companyId, req.user.companyId));
}
```

---

## Data Protection

### 1. Encryption at Rest

#### Database Encryption
```sql
-- Enable PostgreSQL encryption at rest
ALTER SYSTEM SET shared_preload_libraries = 'pg_crypto';

-- Create encryption functions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Encrypted sensitive fields
CREATE TABLE encrypted_user_data (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    encrypted_ssn TEXT, -- Using pgp_sym_encrypt
    encrypted_bank_account TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Example encryption/decryption
INSERT INTO encrypted_user_data (user_id, encrypted_ssn) 
VALUES (1, pgp_sym_encrypt('123-45-6789', 'encryption_key'));

SELECT user_id, pgp_sym_decrypt(encrypted_ssn::bytea, 'encryption_key') 
FROM encrypted_user_data WHERE user_id = 1;
```

#### Application-Level Encryption
```typescript
// server/utils/encryption.ts
import crypto from 'crypto';

export class EncryptionService {
  private static readonly ALGORITHM = 'aes-256-gcm';
  private static readonly KEY = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex');
  
  static encrypt(text: string): EncryptedData {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(this.ALGORITHM, this.KEY);
    cipher.setAAD(Buffer.from('yemen-construction', 'utf8'));
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    };
  }
  
  static decrypt(encryptedData: EncryptedData): string {
    const decipher = crypto.createDecipher(this.ALGORITHM, this.KEY);
    decipher.setAAD(Buffer.from('yemen-construction', 'utf8'));
    decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}

interface EncryptedData {
  encrypted: string;
  iv: string;
  authTag: string;
}
```

### 2. Data in Transit Security

#### TLS Configuration
```typescript
// server/security/tls.ts
import https from 'https';
import fs from 'fs';

export function createSecureServer(app: Express) {
  if (process.env.NODE_ENV === 'production') {
    const options = {
      key: fs.readFileSync('/etc/ssl/private/server.key'),
      cert: fs.readFileSync('/etc/ssl/certs/server.crt'),
      
      // Security options
      secureProtocol: 'TLSv1_3_method',
      ciphers: [
        'ECDHE-RSA-AES128-GCM-SHA256',
        'ECDHE-RSA-AES256-GCM-SHA384',
        'ECDHE-RSA-AES128-SHA256',
        'ECDHE-RSA-AES256-SHA384'
      ].join(':'),
      honorCipherOrder: true
    };
    
    return https.createServer(options, app);
  }
  
  return app;
}
```

#### Request Validation & Sanitization
```typescript
// server/middleware/validation.ts
import { z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';

export function validateAndSanitize<T>(schema: z.ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Sanitize HTML in all string fields
      const sanitized = sanitizeObject(req.body);
      
      // Validate against schema
      const validated = schema.parse(sanitized);
      req.validatedBody = validated;
      
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors
        });
      }
      next(error);
    }
  };
}

function sanitizeObject(obj: any): any {
  if (typeof obj === 'string') {
    return DOMPurify.sanitize(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  
  if (obj !== null && typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      sanitized[key] = sanitizeObject(obj[key]);
    }
    return sanitized;
  }
  
  return obj;
}
```

---

## Input Validation & SQL Injection Prevention

### 1. Parameterized Queries with Drizzle
```typescript
// server/services/project-service.ts
export class ProjectService {
  static async getUserProjects(userId: number, companyId: number) {
    // Drizzle automatically parameterizes queries
    return await db.query.projects.findMany({
      where: (projects, { eq, and }) => and(
        eq(projects.managerId, userId),
        eq(projects.companyId, companyId)
      ),
      with: {
        transactions: true,
        progressBillings: true
      }
    });
  }
  
  static async searchProjects(query: string, companyId: number) {
    // Safe full-text search
    return await db.execute(sql`
      SELECT * FROM projects 
      WHERE company_id = ${companyId}
      AND (
        to_tsvector('arabic', name_ar) @@ plainto_tsquery('arabic', ${query})
        OR to_tsvector('english', name) @@ plainto_tsquery('english', ${query})
      )
      LIMIT 50
    `);
  }
}
```

### 2. XSS Prevention
```typescript
// client/src/utils/xss-protection.ts
import DOMPurify from 'dompurify';

export function sanitizeHTML(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTR: []
  });
}

export function sanitizeArabicText(text: string): string {
  // Remove any script tags, preserve Arabic characters
  const cleaned = text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  return DOMPurify.sanitize(cleaned);
}

// React component with XSS protection
export function SafeDisplayText({ text, isArabic = false }: { text: string, isArabic?: boolean }) {
  const sanitized = isArabic ? sanitizeArabicText(text) : sanitizeHTML(text);
  
  return (
    <div 
      dangerouslySetInnerHTML={{ __html: sanitized }}
      dir={isArabic ? 'rtl' : 'ltr'}
    />
  );
}
```

---

## Security Headers & CORS

### 1. Comprehensive Security Headers
```typescript
// server/middleware/security-headers.ts
import helmet from 'helmet';

export function setupSecurityHeaders(app: Express) {
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://trusted-cdns.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        connectSrc: ["'self'", "https://api.exchangerate-api.com"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        frameAncestors: ["'none'"]
      }
    },
    
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true
    },
    
    noSniff: true,
    xssFilter: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    
    crossOriginEmbedderPolicy: false, // For file uploads
    crossOriginOpenerPolicy: { policy: 'same-origin' },
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  }));
  
  // Additional custom headers
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    next();
  });
}
```

### 2. CORS Configuration
```typescript
// server/middleware/cors.ts
import cors from 'cors';

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'];
    
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS policy'));
    }
  },
  
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-Company-ID',
    'X-Request-ID'
  ],
  
  maxAge: 86400 // 24 hours
};

export const corsMiddleware = cors(corsOptions);
```

---

## Rate Limiting & DDoS Protection

### 1. Advanced Rate Limiting
```typescript
// server/middleware/rate-limiting.ts
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

// General API rate limiting
export const generalLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args: string[]) => redis.call(...args),
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // requests per window
  message: {
    error: 'Too many requests from this IP',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Strict rate limiting for authentication
export const authLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args: string[]) => redis.call(...args),
  }),
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 login attempts per 15 minutes
  skipSuccessfulRequests: true,
  message: {
    error: 'Too many login attempts',
    errorAr: 'محاولات دخول كثيرة جداً',
    retryAfter: '15 minutes'
  }
});

// File upload rate limiting
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 uploads per hour
  message: {
    error: 'Upload limit exceeded',
    errorAr: 'تم تجاوز حد الرفع المسموح'
  }
});
```

### 2. Request Size Limiting
```typescript
// server/middleware/request-limiting.ts
import { Request, Response, NextFunction } from 'express';

export function requestSizeLimiter(maxSize: number = 10 * 1024 * 1024) { // 10MB default
  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = parseInt(req.get('content-length') || '0');
    
    if (contentLength > maxSize) {
      return res.status(413).json({
        error: 'Request too large',
        maxSize: `${maxSize / 1024 / 1024}MB`
      });
    }
    
    next();
  };
}

// IP-based request tracking
export function suspiciousActivityDetector() {
  const requestCounts = new Map<string, number>();
  
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip;
    const current = requestCounts.get(ip) || 0;
    
    if (current > 100) { // More than 100 requests per minute
      return res.status(429).json({
        error: 'Suspicious activity detected',
        blocked: true
      });
    }
    
    requestCounts.set(ip, current + 1);
    
    // Reset counter every minute
    setTimeout(() => {
      requestCounts.delete(ip);
    }, 60000);
    
    next();
  };
}
```

---

## Audit Logging & Monitoring

### 1. Comprehensive Audit Trail
```typescript
// server/utils/audit-logger.ts
export class AuditLogger {
  static async logAction(action: AuditAction): Promise<void> {
    await db.insert(auditLogs).values({
      userId: action.userId,
      entityType: action.entityType,
      entityId: action.entityId,
      action: action.action,
      oldValues: action.oldValues ? JSON.stringify(action.oldValues) : null,
      newValues: action.newValues ? JSON.stringify(action.newValues) : null,
      ipAddress: action.ipAddress,
      userAgent: action.userAgent,
      timestamp: new Date()
    });
  }
  
  static async logSecurityEvent(event: SecurityEvent): Promise<void> {
    await db.insert(securityLogs).values({
      eventType: event.type,
      severity: event.severity,
      description: event.description,
      ipAddress: event.ipAddress,
      userId: event.userId,
      additionalData: JSON.stringify(event.metadata),
      timestamp: new Date()
    });
    
    // Alert on high-severity events
    if (event.severity === 'high' || event.severity === 'critical') {
      await this.sendSecurityAlert(event);
    }
  }
  
  private static async sendSecurityAlert(event: SecurityEvent): Promise<void> {
    // Implementation for immediate security alerts
    // Could be email, SMS, Slack, etc.
  }
}

interface AuditAction {
  userId: number;
  entityType: string;
  entityId: number;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW';
  oldValues?: any;
  newValues?: any;
  ipAddress: string;
  userAgent: string;
}

interface SecurityEvent {
  type: 'failed_login' | 'suspicious_activity' | 'privilege_escalation' | 'data_breach_attempt';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  ipAddress: string;
  userId?: number;
  metadata?: any;
}
```

### 2. Security Monitoring
```typescript
// server/security/monitoring.ts
export class SecurityMonitor {
  static async detectAnomalies(): Promise<SecurityAlert[]> {
    const alerts: SecurityAlert[] = [];
    
    // Check for multiple failed logins
    const failedLogins = await this.getFailedLoginAttempts();
    if (failedLogins.length > 10) {
      alerts.push({
        type: 'brute_force_attempt',
        severity: 'high',
        description: `${failedLogins.length} failed login attempts detected`,
        affectedIPs: failedLogins.map(f => f.ipAddress)
      });
    }
    
    // Check for unusual access patterns
    const unusualAccess = await this.detectUnusualAccess();
    alerts.push(...unusualAccess);
    
    // Check for privilege escalation attempts
    const privilegeAttempts = await this.detectPrivilegeEscalation();
    alerts.push(...privilegeAttempts);
    
    return alerts;
  }
  
  private static async getFailedLoginAttempts(): Promise<FailedLogin[]> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    return await db.query.securityLogs.findMany({
      where: (logs, { eq, and, gt }) => and(
        eq(logs.eventType, 'failed_login'),
        gt(logs.timestamp, oneHourAgo)
      )
    });
  }
  
  private static async detectUnusualAccess(): Promise<SecurityAlert[]> {
    // Implementation for detecting unusual access patterns
    // e.g., access from new geographical locations, unusual hours, etc.
    return [];
  }
  
  private static async detectPrivilegeEscalation(): Promise<SecurityAlert[]> {
    // Implementation for detecting privilege escalation attempts
    return [];
  }
}

interface SecurityAlert {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedIPs?: string[];
  affectedUsers?: number[];
  timestamp?: Date;
}
```

---

## File Upload Security

### 1. Secure File Handling
```typescript
// server/middleware/file-upload.ts
import multer from 'multer';
import crypto from 'crypto';
import path from 'path';
import { promisify } from 'util';
import { pipeline } from 'stream';
import sharp from 'sharp';

const streamPipeline = promisify(pipeline);

// Allowed file types with validation
const ALLOWED_TYPES = {
  'application/pdf': '.pdf',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/vnd.ms-excel': '.xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif'
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), 'uploads', 'documents');
    cb(null, uploadPath);
  },
  
  filename: (req, file, cb) => {
    const uniqueName = crypto.randomUUID();
    const extension = ALLOWED_TYPES[file.mimetype as keyof typeof ALLOWED_TYPES];
    cb(null, `${uniqueName}${extension}`);
  }
});

function fileFilter(req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  // Check file type
  if (!ALLOWED_TYPES[file.mimetype as keyof typeof ALLOWED_TYPES]) {
    return cb(new Error('Invalid file type'));
  }
  
  // Check file size (handled by limits, but double-check)
  if (file.size > 10 * 1024 * 1024) { // 10MB
    return cb(new Error('File too large'));
  }
  
  cb(null, true);
}

export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 5 // Maximum 5 files per request
  }
});

// Virus scanning (integrate with ClamAV or similar)
export async function scanFile(filePath: string): Promise<boolean> {
  // Implementation would integrate with antivirus software
  // Return true if file is clean, false if infected
  return true; // Placeholder
}

// Image processing and sanitization
export async function processImage(inputPath: string, outputPath: string): Promise<void> {
  await sharp(inputPath)
    .resize(2048, 2048, { 
      fit: 'inside',
      withoutEnlargement: true 
    })
    .jpeg({ 
      quality: 85,
      strip: true // Remove EXIF data
    })
    .toFile(outputPath);
}
```

---

## Environment & Secrets Management

### 1. Secure Environment Configuration
```typescript
// server/config/environment.ts
import { z } from 'zod';

const environmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.string().transform(Number),
  
  // Database
  DATABASE_URL: z.string().url(),
  
  // Secrets
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  ENCRYPTION_KEY: z.string().length(64), // 32 bytes in hex
  
  // External APIs
  YEMEN_MARKET_RATES_API: z.string().url(),
  CURRENCY_EXCHANGE_API: z.string().url(),
  
  // Security
  CORS_ORIGIN: z.string(),
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number)
});

export function validateEnvironment() {
  try {
    return environmentSchema.parse(process.env);
  } catch (error) {
    console.error('❌ Environment validation failed:', error);
    process.exit(1);
  }
}

export const env = validateEnvironment();
```

### 2. Secrets Rotation Strategy
```typescript
// server/security/secrets-rotation.ts
export class SecretsRotationService {
  private static readonly ROTATION_INTERVAL = 30 * 24 * 60 * 60 * 1000; // 30 days
  
  static async rotateJWTSecret(): Promise<void> {
    const newSecret = crypto.randomBytes(64).toString('hex');
    const oldSecret = process.env.JWT_SECRET;
    
    // Update environment with new secret
    process.env.JWT_SECRET = newSecret;
    
    // Store old secret temporarily for token validation
    await this.storeOldSecret('JWT_SECRET', oldSecret!);
    
    // Notify all services about secret rotation
    await this.notifySecretRotation('JWT_SECRET');
  }
  
  static async validateTokenWithOldSecrets(token: string): Promise<JWTPayload | null> {
    try {
      // Try current secret first
      return jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    } catch {
      // Try old secrets
      const oldSecrets = await this.getOldSecrets('JWT_SECRET');
      
      for (const oldSecret of oldSecrets) {
        try {
          return jwt.verify(token, oldSecret) as JWTPayload;
        } catch {
          continue;
        }
      }
      
      return null;
    }
  }
  
  private static async storeOldSecret(type: string, secret: string): Promise<void> {
    await db.insert(rotatedSecrets).values({
      secretType: type,
      secretValue: await EncryptionService.encrypt(secret),
      rotatedAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days grace period
    });
  }
  
  private static async getOldSecrets(type: string): Promise<string[]> {
    const records = await db.query.rotatedSecrets.findMany({
      where: (secrets, { eq, and, gt }) => and(
        eq(secrets.secretType, type),
        gt(secrets.expiresAt, new Date())
      )
    });
    
    return records.map(record => 
      EncryptionService.decrypt(JSON.parse(record.secretValue))
    );
  }
}
```

---

## Compliance & Regulatory Requirements

### 1. Yemen Data Protection Compliance
```typescript
// server/compliance/yemen-data-protection.ts
export class YemenDataProtectionCompliance {
  static async handleDataRequest(userId: number, requestType: DataRequestType): Promise<DataRequestResponse> {
    switch (requestType) {
      case 'access':
        return await this.generateDataExport(userId);
      
      case 'deletion':
        return await this.processDataDeletion(userId);
      
      case 'rectification':
        return await this.handleDataCorrection(userId);
      
      default:
        throw new Error('Invalid data request type');
    }
  }
  
  private static async generateDataExport(userId: number): Promise<DataExport> {
    const userData = await db.query.users.findFirst({
      where: eq(users.id, userId),
      with: {
        projects: true,
        transactions: true,
        auditLogs: true
      }
    });
    
    if (!userData) {
      throw new Error('User not found');
    }
    
    // Remove sensitive fields before export
    const exportData = {
      ...userData,
      password: undefined,
      lastLogin: undefined,
      auditLogs: userData.auditLogs.map(log => ({
        ...log,
        ipAddress: this.anonymizeIP(log.ipAddress)
      }))
    };
    
    return {
      data: exportData,
      exportDate: new Date(),
      format: 'json'
    };
  }
  
  private static async processDataDeletion(userId: number): Promise<DeletionResult> {
    // Anonymize rather than delete to maintain data integrity
    await db.update(users)
      .set({
        name: 'Deleted User',
        nameAr: 'مستخدم محذوف',
        email: null,
        phone: null,
        isActive: false,
        deletedAt: new Date()
      })
      .where(eq(users.id, userId));
    
    // Anonymize audit logs
    await db.update(auditLogs)
      .set({
        ipAddress: '0.0.0.0',
        userAgent: 'Anonymized'
      })
      .where(eq(auditLogs.userId, userId));
    
    return {
      success: true,
      deletionDate: new Date(),
      retentionPeriod: '7 years' // As per Yemen regulations
    };
  }
  
  private static anonymizeIP(ip: string): string {
    const parts = ip.split('.');
    return `${parts[0]}.${parts[1]}.xxx.xxx`;
  }
}

type DataRequestType = 'access' | 'deletion' | 'rectification';

interface DataExport {
  data: any;
  exportDate: Date;
  format: 'json' | 'csv' | 'pdf';
}

interface DeletionResult {
  success: boolean;
  deletionDate: Date;
  retentionPeriod: string;
}
```

### 2. Financial Compliance (IFRS)
```typescript
// server/compliance/ifrs-compliance.ts
export class IFRSComplianceService {
  static async validateFinancialData(projectId: number): Promise<ComplianceResult> {
    const project = await db.query.projects.findFirst({
      where: eq(projects.id, projectId),
      with: {
        transactions: true,
        progressBillings: true,
        ifrsContracts: true
      }
    });
    
    if (!project) {
      throw new Error('Project not found');
    }
    
    const validations = [
      await this.validateRevenueRecognition(project),
      await this.validateCostAccounting(project),
      await this.validateProgressBilling(project),
      await this.validateContractModifications(project)
    ];
    
    const isCompliant = validations.every(v => v.isValid);
    const violations = validations.filter(v => !v.isValid);
    
    return {
      isCompliant,
      violations,
      lastChecked: new Date(),
      complianceScore: this.calculateComplianceScore(validations)
    };
  }
  
  private static async validateRevenueRecognition(project: any): Promise<ValidationResult> {
    // Implement IFRS 15 revenue recognition validation
    const ifrsContract = project.ifrsContracts[0];
    
    if (!ifrsContract) {
      return {
        isValid: false,
        rule: 'IFRS 15 - Contract Recognition',
        message: 'No IFRS contract found for project'
      };
    }
    
    const expectedRevenue = ifrsContract.contractValue * (ifrsContract.percentageComplete / 100);
    const recognizedRevenue = ifrsContract.revenueRecognized;
    
    const variance = Math.abs(expectedRevenue - recognizedRevenue) / expectedRevenue;
    
    return {
      isValid: variance < 0.05, // 5% tolerance
      rule: 'IFRS 15 - Percentage Completion',
      message: variance >= 0.05 ? `Revenue recognition variance: ${(variance * 100).toFixed(2)}%` : 'Revenue recognition within acceptable variance'
    };
  }
}

interface ComplianceResult {
  isCompliant: boolean;
  violations: ValidationResult[];
  lastChecked: Date;
  complianceScore: number;
}

interface ValidationResult {
  isValid: boolean;
  rule: string;
  message: string;
}
```

---

This comprehensive security framework ensures the Yemen Construction Management Platform meets international security standards while maintaining usability and performance for construction industry workflows.