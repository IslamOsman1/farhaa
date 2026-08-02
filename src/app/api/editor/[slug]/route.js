import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function PUT(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const resolvedParams = await params;
    const { slug } = resolvedParams;
    const data = await request.json();

    const updatedInvitation = await prisma.invitation.update({
      where: { slug },
      data: {
        groomName: data.groomName,
        brideName: data.brideName,
        weddingDate: data.weddingDate ? new Date(data.weddingDate) : null,
        venueName: data.venueName,
        venueAddress: data.venueAddress,
        welcomeMessage: data.welcomeMessage,
        musicUrl: data.musicUrl,
        sections: data.sections, // This is already a JSON string from EditorClient
        coupleStory: JSON.stringify({
          verseText: data.verseText,
          invitationText: data.invitationText,
          groomParentsLabel: data.groomParentsLabel,
          groomParents: data.groomParents,
          brideParentsLabel: data.brideParentsLabel,
          brideParents: data.brideParents,
          closingNote: data.closingNote,
          closingHashtag: data.closingHashtag,
          closingFamilies: data.closingFamilies,
          locationLink: data.locationLink,
          program: data.program,
          notes: data.notes,
          contactLabel: data.contactLabel,
          contactName: data.contactName,
          contactPhone: data.contactPhone,
          venueImage: data.venueImage,
          galleryImages: data.galleryImages
        }),
        isActive: true
      }
    });

    return NextResponse.json({ success: true, invitation: updatedInvitation });
  } catch (error) {
    console.error('Error updating invitation:', error);
    return NextResponse.json({ error: 'Failed to update invitation' }, { status: 500 });
  }
}
