import prisma from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api-response';
import { requirePermission } from '@/lib/admin-session';
import { persistUploadedFile } from '@/lib/storage';

export async function POST(request) {
  try {
    const actor = await requirePermission('media.upload');
    const data = await request.formData();
    const file = data.get('file');

    if (!(file instanceof File)) {
      return apiError(new Error('No file provided'), { status: 400 });
    }

    const stored = await persistUploadedFile(file, 'legacy-upload');
    await prisma.mediaAsset.create({
      data: {
        url: stored.url,
        providerKey: stored.storageKey,
        type: stored.fileType,
        fileName: stored.fileName,
        originalName: stored.originalName,
        storageKey: stored.storageKey,
        mimeType: stored.mimeType,
        fileType: stored.fileType,
        sizeBytes: stored.size,
        folder: 'legacy-upload',
        provider: stored.provider,
        originalFilename: stored.originalName,
        createdById: actor.id,
        uploadedBy: actor.id,
      },
    });

    return apiSuccess({ url: stored.url });
  } catch (error) {
    return apiError(error);
  }
}
