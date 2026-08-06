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

export default async function LandingPage() {
  let settings = null;

  try {
    settings = await loadSiteSettingsWithTimeout();
  } catch (error) {
    console.error('Failed to load site settings:', error);
  }

  const whatsappNumber = settings?.whatsapp || '201001473345';

  return <LandingExperience settings={settings} whatsappNumber={whatsappNumber} />;
}
