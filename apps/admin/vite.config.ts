import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { readFile, stat } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { IncomingMessage, ServerResponse } from 'node:http';
const storefrontImages = fileURLToPath(new URL('../storefront/public/images/', import.meta.url));
// Match the existing production /images/ alias while using local Vite servers.
async function sharedImages(request: IncomingMessage, response: ServerResponse, next: () => void) {
  if (!['GET', 'HEAD'].includes(request.method ?? '')) return next();
  try {
    const pathname = decodeURIComponent(new URL(request.url ?? '/', 'http://localhost').pathname);
    if (!pathname.startsWith('/images/')) return next();
    const image = resolve(storefrontImages, pathname.slice('/images/'.length));
    const contentTypes: Record<string, string> = {
      '.webp': 'image/webp',
      '.png': 'image/png',
      '.svg': 'image/svg+xml',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
    };
    const contentType = contentTypes[extname(image).toLowerCase()];
    if (
      !image.startsWith(storefrontImages.replace(/\/$/, '') + sep) ||
      !contentType ||
      !(await stat(image)).isFile()
    )
      return next();
    response.setHeader('Content-Type', contentType);
    response.setHeader('Cache-Control', 'public, max-age=3600');
    response.end(request.method === 'HEAD' ? undefined : await readFile(image));
  } catch {
    next();
  }
}
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const proxy = {
    '/api/admin': {
      target: env.API_PROXY_TARGET ?? 'http://localhost:4000',
      changeOrigin: false,
      rewrite: () => '/graphql',
    },
  };
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'shared-storefront-images',
        configureServer(server) {
          server.middlewares.use(sharedImages);
        },
        configurePreviewServer(server) {
          server.middlewares.use(sharedImages);
        },
      },
    ],
    server: { proxy },
    preview: { proxy },
    build: {
      rollupOptions: {
        output: {
          onlyExplicitManualChunks: true,
          manualChunks(id) {
            if (id.includes('node_modules/recharts/')) return 'charts';
            if (id.includes('node_modules/leaflet/')) return 'maps';
          },
        },
      },
    },
  };
});
