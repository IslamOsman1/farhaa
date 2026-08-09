import prisma from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api-response';
import { requirePermission } from '@/lib/admin-session';
import { hasPermission } from '@/lib/admin-security';
import { getInvitationEffectiveStatus } from '@/lib/invitation-admin';

function parseDateStart(value) {
  if (!value) {
    return null;
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function parseDateEnd(value) {
  if (!value) {
    return null;
  }

  const date = new Date(`${value}T23:59:59.999Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function buildWhere(searchParams) {
  const query = String(searchParams.get('q') || '').trim();
  const status = String(searchParams.get('status') || '').trim().toUpperCase();
  const templateId = String(searchParams.get('templateId') || '').trim();
  const dateFrom = parseDateStart(searchParams.get('dateFrom'));
  const dateTo = parseDateEnd(searchParams.get('dateTo'));
  const where = {};

  if (query) {
    where.OR = [
      { slug: { contains: query } },
      { title: { contains: query } },
      { clientName: { contains: query } },
      { clientPhone: { contains: query } },
      { groomName: { contains: query } },
      { brideName: { contains: query } },
    ];
  }

  if (templateId) {
    where.templateId = templateId;
  }

  if (status && status !== 'ALL') {
    if (status === 'EXPIRED') {
      where.status = 'PUBLISHED';
      where.publishEndDate = {
        lt: new Date(),
      };
    } else {
      where.status = status;
    }
  }

  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) {
      where.createdAt.gte = dateFrom;
    }
    if (dateTo) {
      where.createdAt.lte = dateTo;
    }
  }

  return where;
}

export async function GET(request) {
  try {
    const user = await requirePermission('invitations.view');
    const where = buildWhere(request.nextUrl.searchParams);

    const [invitations, templates] = await Promise.all([
      prisma.invitation.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          template: {
            select: { id: true, slug: true, name: true, nameAr: true },
          },
          _count: {
            select: { rsvps: true, visits: true, entryPasses: true },
          },
        },
      }),
      prisma.template.findMany({
        orderBy: { nameAr: 'asc' },
        select: {
          id: true,
          slug: true,
          name: true,
          nameAr: true,
        },
      }),
    ]);

    const normalizedInvitations = invitations.map((invitation) => ({
      ...invitation,
      effectiveStatus: getInvitationEffectiveStatus(invitation),
      isExpired: getInvitationEffectiveStatus(invitation) === 'EXPIRED',
    }));

    return apiSuccess({
      invitations: normalizedInvitations,
      templates,
      capabilities: {
        canManageRsvps: hasPermission(user.role, 'rsvps.manage'),
      },
      filters: {
        q: request.nextUrl.searchParams.get('q') || '',
        status: request.nextUrl.searchParams.get('status') || 'ALL',
        templateId: request.nextUrl.searchParams.get('templateId') || '',
        dateFrom: request.nextUrl.searchParams.get('dateFrom') || '',
        dateTo: request.nextUrl.searchParams.get('dateTo') || '',
      },
      total: normalizedInvitations.length,
    });
  } catch (error) {
    return apiError(error);
  }
}
