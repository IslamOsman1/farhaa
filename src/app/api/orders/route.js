import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function POST(request) {
  try {
    const data = await request.json();
    const { name, phone, countryCode, occasion, templateId } = data;
    
    if (!name || !phone || !templateId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let template = await prisma.template.findUnique({
      where: { slug: templateId }
    });
    if (!template) {
      template = await prisma.template.create({
        data: {
          name: templateId,
          nameAr: templateId,
          slug: templateId,
        }
      });
    }

    const slug = crypto.randomBytes(6).toString('hex'); // 12 chars

    const fullPhone = `${countryCode}${phone}`;

    const invitation = await prisma.invitation.create({
      data: {
        slug,
        clientName: name,
        clientPhone: fullPhone,
        templateId: template.id,
        groomName: occasion === 'زفاف' ? 'العريس' : name,
        brideName: 'العروس',
        isActive: false // draft mode
      }
    });

    return NextResponse.json({ success: true, slug: invitation.slug }, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
