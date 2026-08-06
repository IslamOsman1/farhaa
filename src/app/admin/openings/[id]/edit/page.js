import prisma from '@/lib/prisma';
import { requirePermission } from '@/lib/admin-session';
import { getAllTemplateManifests } from '@/lib/template-system';
import OpeningForm from '../../OpeningForm';

export const dynamic = 'force-dynamic';

export default async function EditOpeningPage({ params }) {
  await requirePermission('openings.edit');
  const { id } = await params;

  const opening = await prisma.opening.findUnique({ where: { id } });

  if (!opening) {
    return (
      <div className="admin-empty-state">
        الافتتاحية المطلوبة غير موجودة.
      </div>
    );
  }

  return <OpeningForm mode="edit" opening={opening} templateOptions={getAllTemplateManifests()} />;
}
