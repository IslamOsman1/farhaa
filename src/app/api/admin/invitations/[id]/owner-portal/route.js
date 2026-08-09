import prisma from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api-response';
import { requirePermission } from '@/lib/admin-session';
import { buildInvitationOwnerPortalPath, ensureInvitationOwnerPortalToken } from '@/lib/owner-portal';

export async function GET(request, { params }) {
  try {
    await requirePermission('rsvps.manage');
    const { id } = await params;

    const invitation = await prisma.invitation.findUnique({
      where: { id },
      select: {
        id: true,
        shareConfig: true,
      },
    });

    if (!invitation) {
      return apiError(new Error('الدعوة غير موجودة.'), { status: 404 });
    }

    const ownerPortalToken = await ensureInvitationOwnerPortalToken(invitation.id, invitation.shareConfig);
    const overviewPath = buildInvitationOwnerPortalPath({
      invitationId: invitation.id,
      token: ownerPortalToken,
    });
    const entryPassesPath = buildInvitationOwnerPortalPath({
      invitationId: invitation.id,
      token: ownerPortalToken,
      section: 'entry-passes',
    });
    const origin = String(request.nextUrl.origin || '').replace(/\/+$/g, '');

    return apiSuccess({
      overviewPath,
      entryPassesPath,
      overviewUrl: origin ? `${origin}${overviewPath}` : overviewPath,
      entryPassesUrl: origin ? `${origin}${entryPassesPath}` : entryPassesPath,
    });
  } catch (error) {
    return apiError(error);
  }
}
