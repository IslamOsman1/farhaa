import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { hasAnyPermission, hasPermission } from '@/lib/admin-security';

export class AuthError extends Error {
  constructor(message = 'Unauthorized', status = 401) {
    super(message);
    this.name = 'AuthError';
    this.status = status;
  }
}

export async function getAdminSession() {
  return getServerSession(authOptions);
}

export async function requireAuth() {
  const session = await getAdminSession();

  if (!session?.user?.id || !session?.user?.role) {
    throw new AuthError('Unauthorized', 401);
  }

  return session.user;
}

export async function requirePermission(permission) {
  const user = await requireAuth();

  if (permission && !hasPermission(user.role, permission)) {
    throw new AuthError('Forbidden', 403);
  }

  return user;
}

export async function requireAnyPermission(permissions = []) {
  const user = await requireAuth();

  if (permissions.length > 0 && !hasAnyPermission(user.role, permissions)) {
    throw new AuthError('Forbidden', 403);
  }

  return user;
}

export async function requireAdminSession(permission) {
  return requirePermission(permission);
}

export function isAuthError(error) {
  return error instanceof AuthError;
}

export function getErrorStatus(error, fallbackStatus = 500) {
  return error instanceof AuthError ? error.status : fallbackStatus;
}
