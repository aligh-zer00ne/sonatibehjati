import { defaultStoreInformation, storeInformationSchema } from '@behjati/shared/store-information';
import { db } from '../../database/client.js';
import { authError } from '../auth/errors.js';
import { validate } from './validation.js';

export async function readStoreInformation() {
  const row = await db.storeInformation.findUnique({ where: { id: 'store' } });
  if (!row?.isConfigured)
    return { ...defaultStoreInformation, isConfigured: false, updatedAt: null };
  return {
    ...storeInformationSchema.parse(row.data),
    isConfigured: true,
    updatedAt: row.updatedAt.toISOString(),
  };
}
export async function saveStoreInformation(raw: unknown, expectedUpdatedAt?: string | null) {
  const data = validate(storeInformationSchema, raw);
  return db.$transaction(async (tx) => {
    // Serialize the first save too, without replacing existing store information.
    await tx.$executeRaw`INSERT IGNORE INTO StoreInformation (id, data, isConfigured, updatedAt) VALUES ('store', ${JSON.stringify(defaultStoreInformation)}, false, ${new Date(0)})`;
    await tx.$queryRaw`SELECT id FROM StoreInformation WHERE id='store' FOR UPDATE`;
    const previous = await tx.storeInformation.findUniqueOrThrow({ where: { id: 'store' } });
    const version = previous.isConfigured ? previous.updatedAt.toISOString() : null;
    if (version !== (expectedUpdatedAt ?? null))
      throw authError(
        'اطلاعات فروشگاه توسط مدیر دیگری تغییر کرده است؛ اطلاعات جدید را دریافت کنید.',
        'REQUEST_CONFLICT',
      );
    const row = await tx.storeInformation.update({
      where: { id: 'store' },
      data: {
        data,
        isConfigured: true,
        updatedAt: new Date(Math.max(Date.now(), previous.updatedAt.getTime() + 1)),
      },
    });
    return { ...data, isConfigured: true, updatedAt: row.updatedAt.toISOString() };
  });
}
