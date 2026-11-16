import { describe, expect, it, vi } from 'vitest';
import { sendEitaaMessage } from './eitaa';
const config = { token: 'bot1:secret-token', chatId: '11299111' };
describe('Eitaa client', () => {
  it('posts the message form to the bot endpoint', async () => {
    const fetcher = vi.fn(async () => Response.json({ ok: true, result: { message_id: 1 } }));
    await sendEitaaMessage(config, 'سلام', { title: 'سفارش', fetcher });
    const [url, init] = fetcher.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('https://eitaayar.ir/api/bot1:secret-token/sendMessage');
    expect(init.method).toBe('POST');
    const body = init.body as URLSearchParams;
    expect(Object.fromEntries(body)).toEqual({ chat_id: '11299111', text: 'سلام', title: 'سفارش' });
  });
  it('reports rejection without exposing the token', async () => {
    const fetcher = vi.fn(async () =>
      Response.json({ ok: false, description: 'chat not found' }, { status: 400 }),
    );
    const error = await sendEitaaMessage(config, 'x', { fetcher }).catch((e: Error) => e);
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toContain('chat not found');
    expect((error as Error).message).not.toContain('secret-token');
  });
});
