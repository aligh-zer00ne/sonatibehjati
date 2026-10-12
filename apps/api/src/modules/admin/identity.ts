import { readPermissions } from '@behjati/shared/permissions';
export function presentAdminIdentity(admin: {
  id: string;
  email: string;
  role: 'OWNER' | 'STAFF';
  isActive: boolean;
  permissions?: unknown;
}) {
  return {
    id: admin.id,
    email: admin.email,
    role: admin.role,
    isActive: admin.isActive,
    permissions: readPermissions(admin.permissions),
  };
}
