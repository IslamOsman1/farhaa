import { compare } from 'bcryptjs';
import { z } from 'zod';
import prisma from '@/lib/prisma';

const loginAttempts = new Map();
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX_ATTEMPTS = 8;

export const ADMIN_ROLES = ['owner', 'admin', 'editor', 'viewer'];

export const PERMISSIONS = {
  'dashboard.view': ['owner', 'admin', 'editor', 'viewer'],
  'invitations.view': ['owner', 'admin', 'editor', 'viewer'],
  'invitations.create': ['owner', 'admin', 'editor'],
  'invitations.edit': ['owner', 'admin', 'editor'],
  'invitations.delete': ['owner', 'admin'],
  'invitations.publish': ['owner', 'admin'],
  'invitations.restore': ['owner', 'admin'],
  'templates.view': ['owner', 'admin', 'editor', 'viewer'],
  'templates.create': ['owner', 'admin', 'editor'],
  'templates.edit': ['owner', 'admin', 'editor'],
  'templates.delete': ['owner', 'admin'],
  'studio.view': ['owner', 'admin', 'editor', 'viewer'],
  'studio.create': ['owner', 'admin', 'editor'],
  'studio.edit': ['owner', 'admin', 'editor'],
  'studio.delete': ['owner', 'admin'],
  'studio.createInvitation': ['owner', 'admin', 'editor'],
  'studio.saveTemplate': ['owner', 'admin', 'editor'],
  'studio.publishTemplate': ['owner', 'admin'],
  'studio.uploadMedia': ['owner', 'admin', 'editor'],
  'openings.view': ['owner', 'admin', 'editor', 'viewer'],
  'openings.create': ['owner', 'admin', 'editor'],
  'openings.edit': ['owner', 'admin', 'editor'],
  'openings.delete': ['owner', 'admin'],
  'media.view': ['owner', 'admin', 'editor'],
  'media.upload': ['owner', 'admin', 'editor'],
  'media.edit': ['owner', 'admin', 'editor'],
  'media.delete': ['owner', 'admin'],
  'packages.manage': ['owner', 'admin'],
  'clients.manage': ['owner', 'admin'],
  'rsvps.manage': ['owner', 'admin', 'editor'],
  'analytics.view': ['owner', 'admin', 'viewer'],
  'settings.manage': ['owner', 'admin'],
  'users.manage': ['owner'],
  'auditLogs.view': ['owner', 'admin'],

  // Legacy aliases preserved for current code paths.
  viewDashboard: ['owner', 'admin', 'editor', 'viewer'],
  manageInvitations: ['owner', 'admin', 'editor'],
  publishInvitations: ['owner', 'admin'],
  manageTemplates: ['owner', 'admin', 'editor'],
  manageOpenings: ['owner', 'admin', 'editor'],
  managePackages: ['owner', 'admin'],
  manageSettings: ['owner', 'admin'],
  manageMedia: ['owner', 'admin', 'editor'],
  viewAnalytics: ['owner', 'admin', 'viewer'],
  manageAdmins: ['owner'],
};

const credentialsSchema = z.object({
  username: z.string().trim().min(1),
  password: z.string().min(8),
});

const redactedKeyPattern = /(password|secret|token|cookie|authorization|api[-_]?key)/i;

function logAuthDebug(stage, payload = {}) {
  if (process.env.NODE_ENV === 'production') {
    return;
  }

  console.log(`[auth-debug] ${stage}`, redactSensitiveValue(payload));
}

function getLoginKey(identifier, ip) {
  return `${identifier}::${ip || 'unknown'}`;
}

function getAttemptBucket(key) {
  const now = Date.now();
  const existing = loginAttempts.get(key);

  if (!existing || now - existing.startedAt > LOGIN_WINDOW_MS) {
    const fresh = { startedAt: now, count: 0 };
    loginAttempts.set(key, fresh);
    return fresh;
  }

  return existing;
}

function redactSensitiveValue(value) {
  if (Array.isArray(value)) {
    return value.map(redactSensitiveValue);
  }

  if (!value || typeof value !== 'object') {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, nestedValue]) => [
      key,
      redactedKeyPattern.test(key) ? '[REDACTED]' : redactSensitiveValue(nestedValue),
    ]),
  );
}

export function assertAuthEnv() {
  if (!process.env.NEXTAUTH_SECRET) {
    throw new Error('NEXTAUTH_SECRET is required for admin authentication.');
  }
}

export async function authenticateAdmin(credentials, ip = 'unknown') {
  assertAuthEnv();
  logAuthDebug('authenticate:start', {
    ip,
    hasCredentials: Boolean(credentials),
    username: credentials?.username || null,
    passwordLength: typeof credentials?.password === 'string' ? credentials.password.length : null,
  });

  const parsed = credentialsSchema.safeParse(credentials);
  if (!parsed.success) {
    logAuthDebug('authenticate:invalid-credentials-shape', {
      ip,
      issues: parsed.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    });
    return null;
  }

  const { username, password } = parsed.data;
  const bucket = getAttemptBucket(getLoginKey(username, ip));
  logAuthDebug('authenticate:bucket', {
    ip,
    username,
    attempts: bucket.count,
    startedAt: bucket.startedAt,
  });

  if (bucket.count >= LOGIN_MAX_ATTEMPTS) {
    logAuthDebug('authenticate:rate-limited', {
      ip,
      username,
      attempts: bucket.count,
    });
    throw new Error('Too many login attempts. Please try again later.');
  }

  const admin = await prisma.adminUser.findFirst({
    where: {
      OR: [{ email: username }, { username }],
    },
  });

  if (!admin || !admin.isActive) {
    bucket.count += 1;
    logAuthDebug('authenticate:user-missing-or-inactive', {
      ip,
      username,
      attempts: bucket.count,
      foundUser: Boolean(admin),
      active: admin?.isActive || false,
    });
    return null;
  }

  const matches = await compare(password, admin.passwordHash);
  if (!matches) {
    bucket.count += 1;
    logAuthDebug('authenticate:password-mismatch', {
      ip,
      username,
      attempts: bucket.count,
      adminId: admin.id,
    });
    return null;
  }

  loginAttempts.delete(getLoginKey(username, ip));
  logAuthDebug('authenticate:success', {
    ip,
    username,
    adminId: admin.id,
    role: admin.role,
  });

  await prisma.adminUser.update({
    where: { id: admin.id },
    data: { lastLogin: new Date() },
  });

  return {
    id: admin.id,
    name: admin.name,
    email: admin.email,
    username: admin.username,
    role: admin.role,
  };
}

export function hasPermission(role, permission) {
  const allowed = PERMISSIONS[permission] || [];
  return allowed.includes(role);
}

export function hasAnyPermission(role, permissions = []) {
  return permissions.some((permission) => hasPermission(role, permission));
}

export async function writeAuditLog({
  action,
  entityType,
  entityId = null,
  actorId = null,
  summary = null,
  details = null,
  ip = null,
  userAgent = null,
}) {
  try {
    await prisma.auditLog.create({
      data: {
        action,
        entityType,
        entityId,
        actorId,
        summary,
        details: details ? redactSensitiveValue(details) : null,
        ip,
        userAgent,
      },
    });
  } catch (error) {
    console.error('Failed to write audit log:', error);
  }
}
