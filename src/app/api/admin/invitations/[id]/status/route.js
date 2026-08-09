import { z } from 'zod';
import prisma from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api-response';
import { requirePermission } from '@/lib/admin-session';
import { writeAuditLog } from '@/lib/admin-security';

const statusSchema = z.object({
  status: z.enum(['DRAFT', 'PENDING', 'PUBLISHED', 'ARCHIVED', 'REJECTED']),
  publishStartDate: z.string().trim().optional().or(z.literal('')),
  publishEndDate: z.string().trim().optional().or(z.literal('')),
});

function parseOptionalDate(value) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function PUT(request, { params }) {
  try {
    const actor = await requirePermission('invitations.publish');
    const { id } = await params;
    const payload = statusSchema.parse(await request.json());
    const existing = await prisma.invitation.findUnique({ where: { id } });

    if (!existing) {
      return apiError(new Error('الدعوة غير موجودة.'), { status: 404 });
    }

    const updateData = {
      status: payload.status,
      updatedBy: actor.id,
    };

    if (payload.status === 'PUBLISHED') {
      updateData.publishStartDate = parseOptionalDate(payload.publishStartDate) || new Date();
      updateData.publishEndDate = parseOptionalDate(payload.publishEndDate);
      updateData.publishedAt = new Date();
      updateData.isActive = true;
    } else {
      updateData.publishStartDate = null;
      updateData.publishEndDate = null;

      if (payload.status === 'ARCHIVED') {
        updateData.isActive = false;
      } else {
        updateData.isActive = true;
      }
    }

    const invitation = await prisma.invitation.update({
      where: { id },
      data: updateData,
    });

    await writeAuditLog({
      action: 'invitation.status',
      entityType: 'invitation',
      entityId: id,
      actorId: actor.id,
      summary: `Updated invitation status to ${payload.status}`,
      details: { before: existing, after: invitation },
    });

    return apiSuccess(
      { invitation },
      {
        message: 'تم تحديث حالة الدعوة بنجاح.',
      },
    );
  } catch (error) {
    return apiError(error);
  }
}
