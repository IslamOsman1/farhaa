import { z } from 'zod';
import prisma from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api-response';
import { requirePermission } from '@/lib/admin-session';
import { writeAuditLog } from '@/lib/admin-security';

const statusSchema = z.object({
  status: z.string().min(1),
  publishStartDate: z.string().optional(),
  publishEndDate: z.string().optional(),
});

export async function PUT(request, { params }) {
  try {
    const actor = await requirePermission('invitations.publish');
    const { id } = await params;
    const data = statusSchema.parse(await request.json());
    const updateData = { status: data.status };

    if (data.status === 'PUBLISHED') {
      if (data.publishStartDate) updateData.publishStartDate = new Date(data.publishStartDate);
      if (data.publishEndDate) updateData.publishEndDate = new Date(data.publishEndDate);
    }

    const existing = await prisma.invitation.findUnique({ where: { id } });
    const invitation = await prisma.invitation.update({
      where: { id },
      data: updateData,
    });

    await writeAuditLog({
      action: 'invitation.status',
      entityType: 'invitation',
      entityId: id,
      actorId: actor.id,
      summary: `Updated invitation status to ${data.status}`,
      details: { before: existing, after: invitation },
    });

    return apiSuccess({ invitation });
  } catch (error) {
    return apiError(error);
  }
}
