import { z } from 'zod';
import prisma from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api-response';
import { requirePermission } from '@/lib/admin-session';
import { writeAuditLog } from '@/lib/admin-security';

const createSchema = z.object({
  title: z.string().trim().optional(),
  slug: z.string().trim().min(1),
  clientName: z.string().trim().min(1),
  clientPhone: z.string().trim().optional(),
  templateId: z.string().min(1),
  groomName: z.string().trim().min(1),
  brideName: z.string().trim().min(1),
});

export async function POST(request) {
  try {
    const actor = await requirePermission('invitations.create');
    const data = createSchema.parse(await request.json());

    const invitation = await prisma.invitation.create({
      data: {
        title: data.title || `${data.groomName} & ${data.brideName}`,
        slug: data.slug,
        clientName: data.clientName,
        clientPhone: data.clientPhone,
        templateId: data.templateId,
        groomName: data.groomName,
        brideName: data.brideName,
        status: 'DRAFT',
        updatedBy: actor.id,
      },
    });

    await writeAuditLog({
      action: 'invitation.create',
      entityType: 'invitation',
      entityId: invitation.id,
      actorId: actor.id,
      summary: `Created invitation ${invitation.slug}`,
      details: invitation,
    });

    return apiSuccess({ invitation }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
