import { env } from '../../config/env.js';
import { authError } from './errors.js';
export function requireCustomerAuth() {
  if (env.CUSTOMER_AUTH_ENABLED !== 'true')
    throw authError('ورود و خرید مشتریان موقتاً فعال نیست.', 'SERVICE_UNAVAILABLE');
}
