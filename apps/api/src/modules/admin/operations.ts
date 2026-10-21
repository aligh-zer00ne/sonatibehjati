import type { SalesChannel } from '@prisma/client';
import { customerWhere } from './users.js';
import { permissionsSchema } from '@behjati/shared/permissions';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import ExcelJS from 'exceljs';
import { adminUsersFilterSchema } from '@behjati/shared/admin';
import { couponInput, staffInput, entityId } from '@behjati/shared/operations';
import { db } from '../../database/client.js';
import { authError } from '../auth/errors.js';
import { hashAdminPassword } from './passwords.js';
import { validate } from './validation.js';
const conflict = () => authError('اطلاعات تغییر کرده است؛ صفحه را تازه کنید.', 'REQUEST_CONFLICT');
export async function createStaff(raw: unknown) {
  const input = validate(staffInput, raw);
  if ((await db.admin.count()) >= 50)
    throw authError('حداکثر ۵۰ کاربر پنل می‌توان تعریف کرد.', 'BAD_USER_INPUT');
  try {
    return await db.admin.create({
      data: {
        email: input.email,
        passwordHash: await hashAdminPassword(input.password),
        role: 'STAFF',
        permissions: input.permissions,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002')
      throw authError('این ایمیل قبلاً ثبت شده است.', 'BAD_USER_INPUT');
    throw error;
  }
}
export async function setStaffActive(id: string, isActive: boolean) {
  validate(entityId, id);
  return db.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM Admin WHERE id = ${id} FOR UPDATE`;
    const admin = await tx.admin.findUnique({ where: { id } });
    if (!admin || admin.role !== 'STAFF')
      throw authError('فقط حساب همکار قابل تغییر است.', 'FORBIDDEN');
    const result = await tx.admin.update({ where: { id }, data: { isActive } });
    if (!isActive) {
      await tx.adminSession.updateMany({
        where: { adminId: id, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      await tx.adminRefreshToken.updateMany({
        where: { adminId: id, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }
    return result;
  });
}
export const presentCoupon = <T extends { startsAt: Date; expiresAt: Date; updatedAt: Date }>(
  value: T,
) => ({
  ...value,
  startsAt: value.startsAt.toISOString(),
  expiresAt: value.expiresAt.toISOString(),
  updatedAt: value.updatedAt.toISOString(),
});
export async function saveCoupon(
  raw: unknown,
  id?: string | null,
  expectedUpdatedAt?: string | null,
) {
  const parsed = validate(couponInput, raw);
  const data = {
    ...parsed,
    startsAt: new Date(parsed.startsAt),
    expiresAt: new Date(parsed.expiresAt),
    maxDiscountAmount: parsed.maxDiscountAmount ?? null,
    usageLimit: parsed.usageLimit ?? null,
  };
  try {
    return await db.$transaction(async (tx) => {
      if (!id) return presentCoupon(await tx.discountCode.create({ data }));
      validate(entityId, id);
      validate(z.iso.datetime({ offset: true }), expectedUpdatedAt);
      await tx.$queryRaw`SELECT id FROM DiscountCode WHERE id = ${id} FOR UPDATE`;
      const existing = await tx.discountCode.findUnique({ where: { id } });
      if (!existing) throw authError('کد تخفیف یافت نشد.', 'NOT_FOUND');
      if (existing.updatedAt.toISOString() !== expectedUpdatedAt) throw conflict();
      if (existing.usageCount > 0 && existing.code !== data.code)
        throw authError('نام کد استفاده‌شده قابل تغییر نیست.', 'BAD_USER_INPUT');
      if (data.usageLimit !== null && data.usageLimit < existing.usageCount)
        throw authError('سقف استفاده کمتر از دفعات استفاده‌شده است.', 'BAD_USER_INPUT');
      return presentCoupon(await tx.discountCode.update({ where: { id }, data }));
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002')
      throw authError('این کد تخفیف قبلاً تعریف شده است.', 'BAD_USER_INPUT');
    throw error;
  }
}
export async function customerExport(rawSearch = '', salesChannel?: SalesChannel | null) {
  const { search } = validate(adminUsersFilterSchema, {
    search: rawSearch,
    salesChannel: salesChannel ?? undefined,
  });
  const where = customerWhere(search, salesChannel);
  const users = await db.user.findMany({
    where,
    select: { phone: true, firstName: true, lastName: true },
    orderBy: { id: 'asc' },
    take: 10001,
  });
  if (users.length > 10000)
    throw authError('خروجی تا ۱۰٬۰۰۰ مشتری است؛ ابتدا جستجو را محدود کنید.', 'BAD_USER_INPUT');
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('مشتریان', {
    views: [{ rightToLeft: true, state: 'frozen', ySplit: 1 }],
  });
  sheet.columns = [
    { header: 'شماره موبایل', key: 'phone', width: 22 },
    { header: 'نام', key: 'firstName', width: 25 },
    { header: 'نام خانوادگی', key: 'lastName', width: 25 },
  ];
  sheet.getColumn('phone').numFmt = '@';
  // String cell values never become formulas, and the leading zero stays intact.
  for (const user of users)
    sheet.addRow({
      phone: user.phone,
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
    });
  sheet.getRow(1).font = { bold: true };
  sheet.autoFilter = 'A1:C1';
  const buffer = await workbook.xlsx.writeBuffer();
  return {
    filename: 'customers.xlsx',
    base64: Buffer.from(buffer).toString('base64'),
    count: users.length,
  };
}

export async function setStaffPermissions(id: string, raw: unknown) {
  validate(entityId, id);
  const permissions = validate(permissionsSchema, raw);
  return db.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM Admin WHERE id = ${id} FOR UPDATE`;
    const admin = await tx.admin.findUnique({ where: { id } });
    if (!admin || admin.role !== 'STAFF')
      throw authError('فقط دسترسی همکار قابل تغییر است.', 'FORBIDDEN');
    const result = await tx.admin.update({ where: { id }, data: { permissions } });
    const revokedAt = new Date();
    await tx.adminSession.updateMany({
      where: { adminId: id, revokedAt: null },
      data: { revokedAt },
    });
    await tx.adminRefreshToken.updateMany({
      where: { adminId: id, revokedAt: null },
      data: { revokedAt },
    });
    return result;
  });
}
