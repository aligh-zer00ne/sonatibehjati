import { defaultMessageTemplates, messageTemplatesSchema } from '@behjati/shared/message-templates';
import { db } from '../../database/client.js';
import { authError } from '../auth/errors.js';
import { readStoreInformation } from './store-information.js';
import { validate } from './validation.js';

export async function readMessageTemplates() {
  const [row, store] = await Promise.all([
    db.messageTemplateSettings.findUnique({ where: { id: 'store' } }),
    readStoreInformation(),
  ]);
  return {
    items: row ? messageTemplatesSchema.parse(row.data) : defaultMessageTemplates,
    updatedAt: row?.updatedAt.toISOString() ?? null,
    storeName: store.name,
  };
}
export async function saveMessageTemplates(raw: unknown, expectedUpdatedAt?: string | null) {
  const items = validate(messageTemplatesSchema, raw);
  await db.$transaction(async (tx) => {
    await tx.$executeRaw`INSERT IGNORE INTO MessageTemplateSettings (id, data, updatedAt) VALUES ('store', ${JSON.stringify(defaultMessageTemplates)}, ${new Date(0)})`;
    await tx.$queryRaw`SELECT id FROM MessageTemplateSettings WHERE id='store' FOR UPDATE`;
    const previous = await tx.messageTemplateSettings.findUniqueOrThrow({ where: { id: 'store' } });
    const version = previous.updatedAt.getTime() === 0 ? null : previous.updatedAt.toISOString();
    if (version !== (expectedUpdatedAt ?? null)) {
      // A lost response can be retried without creating another revision.
      if (JSON.stringify(messageTemplatesSchema.parse(previous.data)) === JSON.stringify(items))
        return;
      throw authError('قالب‌ها تغییر کرده‌اند؛ آخرین نسخه را دریافت کنید.', 'REQUEST_CONFLICT');
    }
    await tx.messageTemplateSettings.update({
      where: { id: 'store' },
      data: {
        data: items,
        updatedAt: new Date(Math.max(Date.now(), previous.updatedAt.getTime() + 1)),
      },
    });
  });
  return readMessageTemplates();
}
