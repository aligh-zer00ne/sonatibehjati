import { Prisma } from '@prisma/client';
import { homepageSchema, defaultHomepage } from '@behjati/shared/homepage';
import { db } from '../../database/client.js';
import { validate } from './validation.js';
import { authError } from '../auth/errors.js';
const conflict = () =>
  authError('محتوا توسط مدیر دیگری تغییر کرده است؛ صفحه را تازه کنید.', 'REQUEST_CONFLICT');
export async function homepageContent() {
  const record = await db.homepageContent.findUnique({ where: { id: 'homepage' } });
  return {
    ...(record ? homepageSchema.parse(record.data) : defaultHomepage),
    updatedAt: record?.updatedAt.toISOString() ?? null,
  };
}
export async function saveHomepageContent(raw: unknown, expectedUpdatedAt?: string | null) {
  const data = validate(homepageSchema, raw);
  try {
    return await db.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM HomepageContent WHERE id = 'homepage' FOR UPDATE`;
      const previous = await tx.homepageContent.findUnique({ where: { id: 'homepage' } });
      if ((previous?.updatedAt.toISOString() ?? null) !== (expectedUpdatedAt ?? null))
        throw conflict();
      const record = previous
        ? await tx.homepageContent.update({ where: { id: 'homepage' }, data: { data } })
        : await tx.homepageContent.create({ data: { id: 'homepage', data } });
      return { ...data, updatedAt: record.updatedAt.toISOString() };
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      ['P2002', 'P2034'].includes(error.code)
    )
      throw conflict();
    throw error;
  }
}
