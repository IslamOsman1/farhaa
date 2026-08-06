import { describe, expect, it } from 'vitest';
import { hasPermission } from '@/lib/admin-security';

describe('admin permissions', () => {
  it('allows owners to manage admins and blocks viewers', () => {
    expect(hasPermission('owner', 'manageAdmins')).toBe(true);
    expect(hasPermission('viewer', 'manageAdmins')).toBe(false);
  });

  it('allows editors to manage invitations but not publish them', () => {
    expect(hasPermission('editor', 'manageInvitations')).toBe(true);
    expect(hasPermission('editor', 'publishInvitations')).toBe(false);
  });
});
