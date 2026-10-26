import { createServer } from 'node:net';

export async function availablePort(preferred, reserved = new Set()) {
  if (!Number.isInteger(preferred) || preferred < 1024 || preferred > 65535)
    throw new Error('Development ports must be integers between 1024 and 65535.');
  for (let port = preferred; port <= 65535; port++) {
    if (reserved.has(port)) continue;
    const free = await new Promise((resolve, reject) => {
      const server = createServer();
      server.once('error', (error) => {
        if (['EADDRINUSE', 'EACCES'].includes(error.code)) resolve(false);
        else reject(error);
      });
      // Check the wildcard address, including listeners bound only to loopback.
      server.listen(port, () => server.close(() => resolve(true)));
    });
    if (free) {
      reserved.add(port);
      return port;
    }
  }
  throw new Error('No free development port found.');
}

export async function developmentEnvironment(env) {
  const reserved = new Set();
  const storefront = await availablePort(Number(env.DEV_STOREFRONT_PORT ?? 3000), reserved);
  const admin = await availablePort(Number(env.DEV_ADMIN_PORT ?? 3001), reserved);
  const api = await availablePort(Number(env.DEV_API_PORT ?? 4000), reserved);
  return {
    ports: { storefront, admin, api },
    env: {
      ...env,
      NODE_ENV: 'development',
      PORT: String(api),
      STOREFRONT_ORIGIN: `http://localhost:${storefront}`,
      ADMIN_ORIGIN: `http://localhost:${admin}`,
      NEXT_PUBLIC_SITE_URL: `http://localhost:${storefront}`,
      API_URL: `http://127.0.0.1:${api}/graphql`,
      API_PROXY_TARGET: `http://127.0.0.1:${api}`,
      VITE_API_URL: '/api/admin',
      VITE_STOREFRONT_URL: `http://localhost:${storefront}`,
    },
  };
}
