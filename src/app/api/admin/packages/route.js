import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await request.json();
    const pkg = await prisma.package.create({
      data: {
        name: data.name,
        nameAr: data.nameAr,
        price: data.price,
        currency: data.currency,
        featuresAr: data.featuresAr,
        isPopular: data.isPopular
      }
    });
    return NextResponse.json({ success: true, package: pkg });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create package' }, { status: 500 });
  }
}
