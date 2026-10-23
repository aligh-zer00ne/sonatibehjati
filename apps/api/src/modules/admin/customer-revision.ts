import { createHash } from 'node:crypto';
import type { User, Address } from '@prisma/client';
export function customerRevision(
  user: Pick<User, 'id' | 'phone' | 'firstName' | 'lastName' | 'email' | 'updatedAt'>,
  address: Address | null,
) {
  return createHash('sha256')
    .update(
      JSON.stringify({
        id: user.id,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        updatedAt: user.updatedAt.toISOString(),
        address,
      }),
    )
    .digest('hex');
}
