import '@/styles/landing.css';
import LandingExperience from '@/components/landing/LandingExperience';

import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'فرحة | FARHA - منصة دعوات الزفاف الرقمية',
  description:
    'اجعل يوم زفافك لا ينسى مع دعوات فرحة الرقمية. قوالب أنيقة، تأكيد حضور، والمزيد.',
};

async function loadSiteSettingsWithTimeout(timeoutMs = 3000) {
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`Site settings query timed out after ${timeoutMs}ms`)), timeoutMs);
  });

  return Promise.race([prisma.siteSettings.findFirst(), timeoutPromise]);
}

async function loadPackagesWithTimeout(timeoutMs = 3000) {
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`Packages query timed out after ${timeoutMs}ms`)), timeoutMs);
  });

  return Promise.race([
    prisma.package.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    }),
    timeoutPromise,
  ]);
}

export default async function LandingPage() {
  let settings = null;
  let packages = [];

  try {
    settings = await loadSiteSettingsWithTimeout();
  } catch (error) {
    console.error('Failed to load site settings:', error);
  }

  try {
    packages = await loadPackagesWithTimeout();
  } catch (error) {
    console.error('Failed to load packages:', error);
  }

  const whatsappNumber = settings?.whatsapp || '201001473345';

  return <LandingExperience settings={settings} packages={packages} whatsappNumber={whatsappNumber} />;
}
