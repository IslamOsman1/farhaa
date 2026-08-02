import '@/styles/landing.css';
import LandingExperience from '@/components/landing/LandingExperience';

import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'فرحة | FARHA - منصة دعوات الزفاف الرقمية',
  description:
    'اجعل يوم زفافك لا ينسى مع دعوات فرحة الرقمية. قوالب أنيقة، تأكيد حضور، والمزيد.',
};

export default async function LandingPage() {
  let settings = null;

  try {
    settings = await prisma.siteSettings.findFirst();
  } catch (error) {
    console.error('Failed to load site settings:', error);
  }

  const whatsappNumber = settings?.whatsapp || '201001473345';

  return <LandingExperience settings={settings} whatsappNumber={whatsappNumber} />;
}
