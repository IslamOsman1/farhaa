import { randomBytes } from 'node:crypto';
import prisma from '@/lib/prisma';

const OWNER_PORTAL_TOKEN_KEY = 'ownerPortalToken';

function normalizeShareConfig(shareConfig) {
  if (!shareConfig || typeof shareConfig !== 'object' || Array.isArray(shareConfig)) {
    return {};
  }

  return shareConfig;
}

function buildOwnerPortalToken() {
  return `own_${randomBytes(18).toString('hex')}`;
}

export function getInvitationOwnerPortalToken(invitation) {
  const shareConfig = normalizeShareConfig(invitation?.shareConfig);
  const token = shareConfig?.[OWNER_PORTAL_TOKEN_KEY];
  return typeof token === 'string' && token.trim() ? token.trim() : '';
}

export function hasInvitationOwnerPortalAccess(invitation, token) {
  const expectedToken = getInvitationOwnerPortalToken(invitation);
  return Boolean(expectedToken && String(token || '').trim() === expectedToken);
}

export async function ensureInvitationOwnerPortalToken(invitationId, currentShareConfig = undefined) {
  const shareConfig = currentShareConfig === undefined
    ? (
        await prisma.invitation.findUnique({
          where: { id: invitationId },
          select: { shareConfig: true },
        })
      )?.shareConfig
    : currentShareConfig;

  const normalizedShareConfig = normalizeShareConfig(shareConfig);
  const existingToken = getInvitationOwnerPortalToken({ shareConfig: normalizedShareConfig });

  if (existingToken) {
    return existingToken;
  }

  const ownerPortalToken = buildOwnerPortalToken();

  await prisma.invitation.update({
    where: { id: invitationId },
    data: {
      shareConfig: {
        ...normalizedShareConfig,
        [OWNER_PORTAL_TOKEN_KEY]: ownerPortalToken,
        ownerPortalCreatedAt: new Date().toISOString(),
      },
    },
  });

  return ownerPortalToken;
}

export function buildInvitationOwnerPortalPath({ invitationId, token, section = 'overview' }) {
  const basePath = section === 'entry-passes'
    ? `/owner/invitations/${invitationId}/entry-passes`
    : `/owner/invitations/${invitationId}`;

  const params = new URLSearchParams();
  if (token) {
    params.set('token', token);
  }

  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}
