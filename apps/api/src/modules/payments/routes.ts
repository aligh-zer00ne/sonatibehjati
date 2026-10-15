import express from 'express';
import { timingSafeEqual } from 'node:crypto';
import { GraphQLError } from 'graphql';
import { z } from 'zod';
import { env } from '../../config/env.js';
import { callback, findPayment, publicPayment, redirectPath, resultPath } from './service.js';
export const paymentRoutes = express.Router();
paymentRoutes.use('/payments/sep', (req, res, next) => {
  const supplied = req.get('X-Auth-Proxy-Key') ?? '';
  const expected = env.AUTH_PROXY_SECRET ?? '';
  if (
    !expected ||
    Buffer.byteLength(supplied) !== Buffer.byteLength(expected) ||
    !timingSafeEqual(Buffer.from(supplied), Buffer.from(expected))
  ) {
    res.sendStatus(403);
    return;
  }
  res.setHeader('Cache-Control', 'no-store');
  next();
});
paymentRoutes.use('/payments/sep', express.json({ limit: '8kb' }));
paymentRoutes.post('/payments/sep/:action', async (req, res) => {
  try {
    const input = z
      .object({
        id: z.string().uuid(),
        key: z.string().regex(/^[a-f0-9]{64}$/),
        fields: z.record(z.string().max(100), z.string().max(1000)).optional(),
      })
      .strict()
      .parse(req.body);
    if (req.params.action === 'callback') {
      if (!input.fields) {
        res.sendStatus(400);
        return;
      }
      const normalized: Record<string, string> = {};
      for (const [key, value] of Object.entries(input.fields)) {
        const name = key.toLowerCase();
        if (name in normalized) {
          res.sendStatus(400);
          return;
        }
        normalized[name] = value;
      }
      res.json({ resultUrl: await callback(input.id, input.key, normalized) });
    } else if (req.params.action === 'status') res.json(await publicPayment(input.id, input.key));
    else if (req.params.action === 'redirect') {
      const p = await findPayment(input.id, input.key);
      res.json({
        token:
          p.status === 'READY' && p.expiresAt > new Date() && !p.order?.paidAt ? p.token : null,
        resultUrl: resultPath(p),
        redirectUrl: redirectPath(p),
      });
    } else res.sendStatus(404);
  } catch (error) {
    res
      .status(error instanceof GraphQLError && error.extensions.code === 'NOT_FOUND' ? 404 : 400)
      .json({ message: 'اطلاعات پرداخت معتبر نیست.' });
  }
});
