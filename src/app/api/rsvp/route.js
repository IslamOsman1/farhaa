import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req) {
  try {
    const data = await req.json();
    
    // Support both camelCase and snake_case (used by older templates)
    const invitationId = data.invitationId || data.invitation_id;
    const guestName = data.guestName || data.guest_name;
    const phone = data.phone;
    const status = data.status || data.attending || 'confirmed';
    const companions = data.companions !== undefined ? data.companions : data.guests;
    const message = data.message;

    if (!invitationId || !guestName) {
      return NextResponse.json({ error: 'البيانات غير مكتملة' }, { status: 400 });
    }

    const rsvp = await prisma.rSVP.create({
      data: {
        invitationId,
        guestName,
        phone: phone || null,
        status: status || 'confirmed',
        companions: companions ? parseInt(companions, 10) : 0,
        message: message || null
      }
    });

    return NextResponse.json({ success: true, rsvp }, { status: 201 });
  } catch (error) {
    console.error('RSVP Error:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء حفظ الرد' }, { status: 500 });
  }
}
