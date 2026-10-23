import { Prisma } from '@prisma/client';
import { adminOrdersFilterSchema } from '@behjati/shared/admin';
import { iranProvinces, provinceCode, provinceKeys } from '@behjati/shared/provinces';
import { db } from '../../database/client.js';
import { authError } from '../auth/errors.js';
import { validate, omitNulls, serializeDates } from './validation.js';
import { dayStart, dayAfter } from './time.js';
import { customerSelect, orderAddress } from './orders.js';

// Static JSON expressions; every request value below is a bound SQL parameter.
const json = (field: 'province' | 'city' | 'recipientName' | 'latitude' | 'longitude') =>
  Prisma.sql`JSON_UNQUOTE(JSON_EXTRACT(o.addressSnapshot, ${'$.' + field}))`;
let normalizedProvince = Prisma.sql`COALESCE(${json('province')}, '')`;
for (const [from, to] of [
  ['ي', 'ی'],
  ['ك', 'ک'],
  ['آ', 'ا'],
  ['استان', ''],
  [' ', ''],
  ['\u200c', ''],
  ['-', ''],
  ['ـ', ''],
  ['\t', ''],
  ['\n', ''],
  ['\r', ''],
  ['\u00a0', ''],
  ['\u2009', ''],
  ['\u202f', ''],
])
  normalizedProvince = Prisma.sql`REPLACE(${normalizedProvince}, ${from}, ${to})`;
const hasLocation = Prisma.sql`JSON_TYPE(JSON_EXTRACT(o.addressSnapshot, '$.latitude')) IN ('INTEGER','DOUBLE','DECIMAL') AND JSON_TYPE(JSON_EXTRACT(o.addressSnapshot, '$.longitude')) IN ('INTEGER','DOUBLE','DECIMAL') AND CAST(${json('latitude')} AS DECIMAL(12,6)) BETWEEN -85 AND 85 AND CAST(${json('longitude')} AS DECIMAL(12,6)) BETWEEN -180 AND 180`;
const like = (value: string) =>
  '%' + value.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_') + '%';
type Group = {
  province: string;
  count: bigint;
  located: bigint | Prisma.Decimal;
  latitude: Prisma.Decimal | null;
  longitude: Prisma.Decimal | null;
};

export async function adminOrdersMap(raw: Record<string, unknown>, selected?: string | null) {
  const input = validate(adminOrdersFilterSchema, omitNulls(raw));
  if (selected && selected !== 'unknown' && !iranProvinces.some((p) => p.code === selected))
    throw authError('استان انتخاب‌شده معتبر نیست.', 'BAD_USER_INPUT');
  const conditions: Prisma.Sql[] = [Prisma.sql`1=1`];
  if (input.salesChannel) conditions.push(Prisma.sql`o.salesChannel = ${input.salesChannel}`);
  if (input.manualOnly) conditions.push(Prisma.sql`o.salesChannel IN ('INSTAGRAM','IN_PERSON')`);
  if (input.shippingMethod) conditions.push(Prisma.sql`o.shippingMethod = ${input.shippingMethod}`);
  if (input.status) conditions.push(Prisma.sql`o.status = ${input.status}`);
  if (input.userId) conditions.push(Prisma.sql`o.userId = ${input.userId}`);
  if (input.number) conditions.push(Prisma.sql`o.number = ${input.number}`);
  if (input.from) conditions.push(Prisma.sql`o.createdAt >= ${dayStart(input.from)}`);
  if (input.to) conditions.push(Prisma.sql`o.createdAt < ${dayAfter(input.to)}`);
  if (input.city) conditions.push(Prisma.sql`${json('city')} LIKE ${'%' + input.city + '%'}`);
  if (input.search) {
    const number = /^\d+$/.test(input.search) ? Number(input.search) : 0;
    const searches = [
      Prisma.sql`u.phone LIKE ${like(input.search)}`,
      Prisma.sql`u.firstName LIKE ${like(input.search)}`,
      Prisma.sql`u.lastName LIKE ${like(input.search)}`,
      // Match Prisma's JSON string_contains wildcard semantics used by adminOrders.
      Prisma.sql`${json('recipientName')} LIKE ${'%' + input.search + '%'}`,
    ];
    if (number > 0 && number <= 2147483647) searches.push(Prisma.sql`o.number = ${number}`);
    conditions.push(Prisma.sql`(${Prisma.join(searches, ' OR ')})`);
  }
  const base = Prisma.sql`FROM \`Order\` o JOIN \`User\` u ON u.id=o.userId WHERE ${Prisma.join(conditions, ' AND ')}`;
  return db.$transaction(async (tx) => {
    const groups = await tx.$queryRaw<
      Group[]
    >`SELECT ${normalizedProvince} AS province, COUNT(*) AS count, SUM(CASE WHEN ${hasLocation} THEN 1 ELSE 0 END) AS located, AVG(CASE WHEN ${hasLocation} THEN CAST(${json('latitude')} AS DECIMAL(12,6)) ELSE NULL END) AS latitude, AVG(CASE WHEN ${hasLocation} THEN CAST(${json('longitude')} AS DECIMAL(12,6)) ELSE NULL END) AS longitude ${base} GROUP BY province`;
    const summaries = new Map(
      [...iranProvinces, { code: 'unknown', name: 'استان نامشخص' }].map((p) => [
        p.code,
        {
          ...p,
          count: 0,
          locatedCount: 0,
          latitude: null as number | null,
          longitude: null as number | null,
        },
      ]),
    );
    for (const group of groups) {
      const entry = summaries.get(provinceCode(group.province))!;
      const located = Number(group.located),
        count = Number(group.count);
      if (located) {
        entry.latitude =
          ((entry.latitude ?? 0) * entry.locatedCount + Number(group.latitude) * located) /
          (entry.locatedCount + located);
        entry.longitude =
          ((entry.longitude ?? 0) * entry.locatedCount + Number(group.longitude) * located) /
          (entry.locatedCount + located);
      }
      entry.locatedCount += located;
      entry.count += count;
    }
    const provinces = [...summaries.values()];
    const total = provinces.reduce((sum, p) => sum + p.count, 0);
    const locatedCount = provinces.reduce((sum, p) => sum + p.locatedCount, 0);
    const pageTotal = selected ? summaries.get(selected)!.count : total;
    const provinceFilter = !selected
      ? Prisma.empty
      : selected === 'unknown'
        ? Prisma.sql`AND ${normalizedProvince} NOT IN (${Prisma.join(iranProvinces.flatMap((p) => provinceKeys(p.code)))})`
        : Prisma.sql`AND ${normalizedProvince} IN (${Prisma.join(provinceKeys(selected))})`;
    const sort =
      input.sort === 'OLDEST'
        ? Prisma.sql`o.createdAt ASC, o.number ASC`
        : input.sort === 'TOTAL_ASC'
          ? Prisma.sql`o.total ASC, o.number ASC`
          : input.sort === 'TOTAL_DESC'
            ? Prisma.sql`o.total DESC, o.number DESC`
            : Prisma.sql`o.createdAt DESC, o.number DESC`;
    const ids = await tx.$queryRaw<
      Array<{ id: string }>
    >`SELECT o.id ${base} ${provinceFilter} ORDER BY ${sort} LIMIT ${input.pageSize} OFFSET ${(input.page - 1) * input.pageSize}`;
    const orders = ids.length
      ? await tx.order.findMany({
          where: { id: { in: ids.map((row) => row.id) } },
          include: { user: { select: customerSelect } },
        })
      : [];
    const byId = new Map(orders.map((o) => [o.id, o]));
    return {
      total,
      locatedCount,
      unknownCount: summaries.get('unknown')!.count,
      provinces,
      pageTotal,
      page: input.page,
      pageSize: input.pageSize,
      totalPages: Math.ceil(pageTotal / input.pageSize),
      items: ids.map(({ id }) => {
        const order = byId.get(id)!;
        return { ...serializeDates(order), address: orderAddress(order.addressSnapshot) };
      }),
    };
  });
}
