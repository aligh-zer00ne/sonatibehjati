import { Prisma } from '@prisma/client';
import { createHash } from 'node:crypto';
import { adminCustomerEditSchema } from '@behjati/shared/admin';
import { db } from '../../database/client.js';
import { validate } from './validation.js';
import { authError } from '../auth/errors.js';
import { customerRevision } from './customer-revision.js';
import { adminUser } from './users.js';
export async function editCustomer(admin: { id: string; email: string }, raw: unknown) {
  const input = validate(adminCustomerEditSchema, raw);
  const fingerprint = createHash('sha256')
    .update(JSON.stringify({ ...input, adminId: admin.id }))
    .digest('hex');
  try {
    await db.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM User WHERE id=${input.id} FOR UPDATE`;
      const previous = await tx.user.findUnique({
        where: { id: input.id },
        include: { addresses: { take: 1, orderBy: [{ isDefault: 'desc' }, { id: 'asc' }] } },
      });
      if (!previous) throw authError('مشتری یافت نشد.', 'NOT_FOUND');
      const replay = await tx.adminRecordChange.findUnique({ where: { id: input.requestId } });
      if (replay) {
        if (
          replay.entityType !== 'CUSTOMER' ||
          replay.entityId !== input.id ||
          replay.requestHash !== fingerprint
        )
          throw authError('این درخواست قبلاً با اطلاعات دیگری ثبت شده است.', 'REQUEST_CONFLICT');
        return;
      }
      const address = previous.addresses[0] ?? null;
      if (customerRevision(previous, address) !== input.expectedRevision)
        throw authError(
          'اطلاعات مشتری یا نشانی او تغییر کرده است؛ نسخهٔ جدید را دریافت کنید.',
          'REQUEST_CONFLICT',
        );
      if (address && !input.address)
        throw authError('نشانی موجود را کامل اصلاح کنید.', 'BAD_USER_INPUT');
      const updatedAt = new Date(Math.max(Date.now(), previous.updatedAt.getTime() + 1));
      const user = await tx.user.update({
        where: { id: input.id },
        data: {
          firstName: input.firstName,
          lastName: input.lastName || null,
          phone: input.phone,
          email: input.email || null,
          updatedAt,
        },
      });
      if (input.address) {
        const moved =
          !address ||
          ['province', 'city', 'postalAddress', 'postalCode'].some(
            (k) =>
              address[k as keyof typeof address] !==
              input.address![k as keyof typeof input.address],
          );
        const data = {
          ...input.address,
          isDefault: true,
          ...(moved ? { latitude: null, longitude: null } : {}),
        };
        await tx.address.updateMany({ where: { userId: input.id }, data: { isDefault: false } });
        if (address) await tx.address.update({ where: { id: address.id }, data });
        else await tx.address.create({ data: { ...data, userId: input.id } });
      }
      if (previous.phone !== input.phone) {
        await tx.userSession.updateMany({
          where: { userId: input.id, revokedAt: null },
          data: { revokedAt: updatedAt },
        });
        await tx.refreshToken.updateMany({
          where: { userId: input.id, revokedAt: null },
          data: { revokedAt: updatedAt },
        });
      }
      const afterAddress = await tx.address.findFirst({
        where: { userId: input.id },
        orderBy: [{ isDefault: 'desc' }, { id: 'asc' }],
      });
      const snapshot = (u: typeof user, a: unknown) => ({
        phone: u.phone,
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        address: a,
      });
      await tx.adminRecordChange.create({
        data: {
          id: input.requestId,
          entityType: 'CUSTOMER',
          entityId: user.id,
          adminId: admin.id,
          adminEmail: admin.email,
          requestHash: fingerprint,
          before: JSON.parse(JSON.stringify(snapshot(previous, address))),
          after: JSON.parse(JSON.stringify(snapshot(user, afterAddress))),
        },
      });
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002')
      throw authError(
        'این موبایل متعلق به مشتری دیگری است؛ حساب‌ها با هم ادغام نشدند.',
        'BAD_USER_INPUT',
      );
    throw e;
  }
  return adminUser(input.id);
}
