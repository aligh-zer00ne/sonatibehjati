import type { AuthContext } from '../../graphql/context.js';
import { readBearer } from './cookies.js';
import { currentUser } from './sessions.js';
import { invalidSession } from './errors.js';
export async function requireUser(context: AuthContext) {
  const user = await currentUser(readBearer(context.request.headers.get('authorization')));
  if (!user) throw invalidSession();
  return user;
}
