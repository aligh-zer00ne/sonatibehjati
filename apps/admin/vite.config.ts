import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
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
    plugins: [react(), tailwindcss()],
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
