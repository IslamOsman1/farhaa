import { notFound, redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import EditorClient from './EditorClient';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function EditInvitationPage({ params }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/admin/login');
  }

  const resolvedParams = await params;
  const { slug } = resolvedParams;

  let invitation = null;
  try {
    invitation = await prisma.invitation.findUnique({
      where: { slug },
      include: {
        template: true
      }
    });
  } catch (error) {
    console.error('Error fetching invitation:', error);
  }

  if (!invitation) {
    return notFound();
  }

  // Parse extra fields from coupleStory
  let extraFields = {};
  try {
    if (invitation.coupleStory) {
      extraFields = JSON.parse(invitation.coupleStory);
    }
  } catch (e) {
    // Ignore JSON parse errors
  }

  const enrichedInvitation = {
    ...invitation,
    ...extraFields
  };

  return <EditorClient initialData={enrichedInvitation} />;
}
