'use server';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// Middleware to check admin session
async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error('Unauthorized');
  }
  return session.user;
}

export async function getDashboardStats() {
  await requireAdmin();
  
  const totalInvitations = await prisma.invitation.count();
  const activeInvitations = await prisma.invitation.count({ where: { isActive: true } });
  const pendingInvitations = await prisma.invitation.count({ where: { status: 'PENDING' } });
  const totalRsvps = await prisma.rSVP.count();
  const totalVisits = await prisma.visit.count();
  
  return {
    totalInvitations,
    activeInvitations,
    pendingInvitations,
    totalRsvps,
    totalVisits
  };
}

export async function getRecentInvitations() {
  await requireAdmin();
  return await prisma.invitation.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: { template: true }
  });
}

export async function getInvitations(status = null) {
  await requireAdmin();
  const where = status ? { status } : {};
  return await prisma.invitation.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { template: true }
  });
}

export async function updateInvitationStatus(id, status) {
  await requireAdmin();
  const inv = await prisma.invitation.update({
    where: { id },
    data: { status }
  });
  revalidatePath('/admin/invitations');
  revalidatePath('/admin/dashboard');
  return inv;
}

export async function createAdminInvitation(data) {
  await requireAdmin();
  
  const inv = await prisma.invitation.create({
    data: {
      slug: data.slug,
      clientName: data.clientName,
      clientPhone: data.clientPhone,
      templateId: data.templateId,
      groomName: data.groom,
      brideName: data.bride,
      weddingDate: data.date ? new Date(data.date) : null,
      status: 'PUBLISHED' // Admin created ones are published immediately
    }
  });
  
  revalidatePath('/admin/invitations');
  revalidatePath('/admin/dashboard');
  return { success: true, id: inv.id };
}

export async function getSiteSettings() {
  await requireAdmin();
  const settings = await prisma.siteSettings.findFirst();
  return settings || {};
}

export async function updateSiteSettings(data) {
  await requireAdmin();
  const existing = await prisma.siteSettings.findFirst();
  if (existing) {
    await prisma.siteSettings.update({
      where: { id: existing.id },
      data
    });
  } else {
    await prisma.siteSettings.create({ data });
  }
  revalidatePath('/admin/settings');
  return { success: true };
}

export async function getTemplates() {
  await requireAdmin();
  return await prisma.template.findMany({ orderBy: { createdAt: 'desc' } });
}
