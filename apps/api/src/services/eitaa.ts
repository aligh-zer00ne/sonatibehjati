/** Minimal Eitaayar bot client (https://eitaayar.ir) for store notifications. */
export type EitaaConfig = { token: string; chatId: string; baseUrl?: string };
export class EitaaError extends Error {}
export async function sendEitaaMessage(
  config: EitaaConfig,
  text: string,
  options: { title?: string; fetcher?: typeof fetch; timeoutMs?: number } = {},
) {
  const body = new URLSearchParams({ chat_id: config.chatId, text });
  if (options.title) body.set('title', options.title);
  const base = (config.baseUrl ?? 'https://eitaayar.ir/api').replace(/\/$/, '');
  const response = await (options.fetcher ?? fetch)(`${base}/${config.token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
    signal: AbortSignal.timeout(options.timeoutMs ?? 10000),
  });
  const result = (await response.json().catch(() => null)) as {
    ok?: boolean;
    description?: string;
  } | null;
  // Never echo the token: it is part of the request URL, not of this message.
  if (!response.ok || !result?.ok)
    throw new EitaaError(
      `Eitaa rejected the message (${response.status}${result?.description ? `: ${result.description}` : ''})`,
    );
  return result;
}
