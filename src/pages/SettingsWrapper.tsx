import React from 'react';
import { useOutletContext } from 'react-router-dom';
import Settings from '../components/Settings';

export default function SettingsWrapper() {
  const context = useOutletContext<any>();
  return (
    <Settings
      currentUser={context.currentUser}
      users={context.users}
      setUsers={context.setUsers}
      rolePermissions={context.rolePermissions}
      setRolePermissions={context.setRolePermissions}
      onLock={context.onLock}
      showToast={context.showToast}
    />
  );
}
