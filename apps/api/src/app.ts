import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { readFileSync } from 'node:fs';
import { createSchema, createYoga } from 'graphql-yoga';
import type { ValidationRule } from 'graphql';
import { operationLimits } from './graphql/limits.js';
import { env } from './config/env.js';
import { resolvers } from './graphql/resolvers.js';
import { db } from './database/client.js';
const app = express();
app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: [env.STOREFRONT_ORIGIN, env.ADMIN_ORIGIN], credentials: true }));
app.use(
  rateLimit({ windowMs: 60000, limit: 120, standardHeaders: 'draft-8', legacyHeaders: false }),
);
app.use(express.json({ limit: '32kb' }));
app.get('/health', (_request, response) => response.json({ status: 'ok' }));
const yoga = createYoga({
  schema: createSchema({
    typeDefs: readFileSync(new URL('./graphql/schema.graphql', import.meta.url), 'utf8'),
    resolvers,
  }),
  graphiql: env.NODE_ENV === 'development',
  maskedErrors: true,
  plugins: [
    {
      onValidate({ addValidationRule }: { addValidationRule: (rule: ValidationRule) => void }) {
        addValidationRule(operationLimits);
      },
    },
  ],
});
app.use('/graphql', yoga);
const server = app.listen(env.PORT, () => console.info(`API listening on ${env.PORT}`));
async function shutdown() {
  server.close();
  await db.$disconnect();
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
