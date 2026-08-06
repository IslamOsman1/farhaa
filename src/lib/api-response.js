import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { getErrorStatus } from '@/lib/admin-session';

export function apiSuccess(data = null, init = {}) {
  const body = {
    success: true,
    data,
    error: null,
    message: init.message || null,
    validationErrors: null,
  };

  return NextResponse.json(body, { status: init.status || 200 });
}

export function apiError(error, init = {}) {
  const status =
    init.status ||
    (error instanceof ZodError ? 422 : getErrorStatus(error, 500));

  const body = {
    success: false,
    data: null,
    error: init.errorCode || (status === 401 ? 'UNAUTHORIZED' : status === 403 ? 'FORBIDDEN' : status === 422 ? 'VALIDATION_ERROR' : 'INTERNAL_ERROR'),
    message:
      init.message ||
      (error instanceof ZodError
        ? 'البيانات المرسلة غير صالحة.'
        : error?.message || 'حدث خطأ غير متوقع.'),
    validationErrors:
      error instanceof ZodError
        ? error.flatten()
        : init.validationErrors || null,
  };

  return NextResponse.json(body, { status });
}
