/* eslint-disable @typescript-eslint/no-require-imports -- PM2 loads ecosystem.config.js as CommonJS. */
const path = require('node:path');
const fs = require('node:fs');
const { parse } = require('dotenv');
const root = path.resolve(__dirname, '..');
const apiEnv = parse(fs.readFileSync(path.join(root, 'apps/api/.env')));
if (
  !['development', 'production'].includes(apiEnv.NODE_ENV) ||
  (apiEnv.NODE_ENV === 'development' && !/^\d{6}$/.test(apiEnv.DEV_OTP_CODE ?? ''))
)
  throw new Error(
    'Configure a development preview with fixed OTP or a production API with real SMS.',
  );
module.exports = {
  apps: [
    {
      name: 'sonatibehjati-api',
      cwd: path.join(root, 'apps/api'),
      script: 'dist/app.js',
      interpreter: process.execPath,
      exec_mode: 'fork',
      instances: 1,
      env: { NODE_ENV: apiEnv.NODE_ENV, PORT: '4100' },
      autorestart: true,
      watch: false,
      restart_delay: 2000,
      time: true,
    },
    {
      name: 'sonatibehjati-storefront',
      cwd: path.join(root, 'apps/storefront'),
      script: path.join(root, 'node_modules/next/dist/bin/next'),
      args: 'start --hostname 127.0.0.1 --port 3100',
      interpreter: process.execPath,
      exec_mode: 'fork',
      instances: 1,
      env: { NODE_ENV: 'production' },
      autorestart: true,
      watch: false,
      restart_delay: 2000,
      time: true,
    },
  ],
};
