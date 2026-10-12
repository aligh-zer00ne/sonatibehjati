import express from 'express';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { GraphQLError } from 'graphql';
import { env } from '../../config/env.js';
import { createAuthContext } from '../../graphql/context.js';
import { requirePermission, requireAdminOrigin } from './auth.js';
import { consumeAuthLimit } from '../auth/rate-limit.js';
import { authError } from '../auth/errors.js';

export const uploadDirectory = resolve(env.UPLOAD_DIRECTORY ?? 'uploads', 'products');
export const adminUploads = express.Router();
adminUploads.post(
  '/admin/uploads',
  async (req, res, next) => {
    try {
      const headers = new Headers();
      for (const [name, value] of Object.entries(req.headers)) {
        if (Array.isArray(value)) value.forEach((item) => headers.append(name, item));
        else if (value !== undefined) headers.set(name, value);
      }
      const context = createAuthContext({
        request: new Request('http://localhost/admin/uploads', { method: 'POST', headers }),
        req,
        res,
      });
      requireAdminOrigin(context);
      const admin = await requirePermission(
        context,
        req.query.purpose === 'homepage' ? 'HOMEPAGE' : 'PRODUCTS',
      );
      await consumeAuthLimit(`admin-upload:${admin.id}`, 30, 60);
      if (
        !['image/jpeg', 'image/png', 'image/webp'].includes(
          req.headers['content-type']?.split(';')[0] ?? '',
        )
      )
        throw authError('فقط تصویر JPG، PNG یا WebP قابل آپلود است.', 'BAD_USER_INPUT');
      next();
    } catch (error) {
      const code = error instanceof GraphQLError ? error.extensions.code : '';
      res
        .status(
          code === 'UNAUTHENTICATED'
            ? 401
            : code === 'FORBIDDEN'
              ? 403
              : code === 'RATE_LIMITED'
                ? 429
                : 400,
        )
        .json({
          message: error instanceof GraphQLError ? error.message : 'آپلود انجام نشد.',
          code,
        });
    }
  },
  express.raw({ type: () => true, limit: '8mb' }),
  async (req, res) => {
    try {
      if (!Buffer.isBuffer(req.body) || req.body.length === 0) throw new Error('Invalid image');
      const metadata = await sharp(req.body, { limitInputPixels: 40_000_000 }).metadata();
      if (!['jpeg', 'png', 'webp'].includes(metadata.format ?? '') || (metadata.pages ?? 1) !== 1)
        throw new Error('Unsupported image');
      const image = await sharp(req.body, { limitInputPixels: 40_000_000 })
        .rotate()
        .resize({ width: 2000, height: 2000, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 90 })
        .toBuffer();
      const name = `${randomUUID()}.webp`;
      await mkdir(uploadDirectory, { recursive: true });
      await writeFile(resolve(uploadDirectory, name), image, { flag: 'wx', mode: 0o644 });
      res.status(201).json({ url: `/uploads/products/${name}` });
    } catch {
      res.status(400).json({
        message: 'تصویر معتبر نیست یا ذخیره نشد. فایل JPG، PNG یا WebP تا ۸ مگابایت انتخاب کنید.',
        code: 'BAD_USER_INPUT',
      });
    }
  },
);
adminUploads.use(
  '/uploads/products',
  (req, res, next) => {
    if (!/^\/[a-f0-9-]{36}\.webp$/.test(req.path)) {
      res.sendStatus(404);
      return;
    }
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
  },
  express.static(uploadDirectory, {
    immutable: true,
    maxAge: '1y',
    index: false,
    dotfiles: 'deny',
  }),
);
adminUploads.use(
  (
    error: { type?: string },
    _req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    if (error.type === 'entity.too.large') {
      res
        .status(413)
        .json({ message: 'حجم تصویر باید حداکثر ۸ مگابایت باشد.', code: 'BAD_USER_INPUT' });
      return;
    }
    next(error);
  },
);
