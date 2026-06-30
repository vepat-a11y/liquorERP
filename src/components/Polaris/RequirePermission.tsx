import React, { createContext, useContext } from 'react';

export interface Permissions {
  "orders.view": boolean;
  "orders.refund": boolean;
  "products.edit": boolean;
  "settings.manage": boolean;
  [key: string]: boolean;
}

export interface Role {
  name: string;
  permissions: Permissions;
}

export interface UserWithPermissions {
  id: string;
  name: string;
  pin: string;
  role: Role;
}

// Default system roles mapping
export const SYSTEM_ROLES: Record<'Admin' | 'Manager' | 'Cashier', Role> = {
  Admin: {
    name: 'Admin',
    permissions: {
      "orders.view": true,
      "orders.refund": true,
      "products.edit": true,
      "settings.manage": true,
    }
  },
  Manager: {
    name: 'Manager',
    permissions: {
      "orders.view": true,
      "orders.refund": true,
      "products.edit": true,
      "settings.manage": false,
    }
  },
  Cashier: {
    name: 'Cashier',
    permissions: {
      "orders.view": true,
      "orders.refund": false,
      "products.edit": false,
      "settings.manage": false,
    }
  }
};

interface PermissionContextType {
  user: UserWithPermissions | null;
  hasPermission: (permission: keyof Permissions) => boolean;
}

const PermissionContext = createContext<PermissionContextType>({
  user: null,
  hasPermission: () => false,
});

export const usePermission = () => useContext(PermissionContext);

export const PermissionProvider: React.FC<{
  user: UserWithPermissions | null;
  children: React.ReactNode;
}> = ({ user, children }) => {
  const hasPermission = (permission: keyof Permissions): boolean => {
    if (!user) return false;
    return !!user.role.permissions[permission];
  };

  return (
    <PermissionContext.Provider value={{ user, hasPermission }}>
      {children}
    </PermissionContext.Provider>
  );
};

interface RequirePermissionProps {
  permission: keyof Permissions;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const RequirePermission: React.FC<RequirePermissionProps> = ({
  permission,
  fallback,
  children,
}) => {
  const { hasPermission } = usePermission();
  const allowed = hasPermission(permission);

  if (!allowed) {
    if (fallback !== undefined) {
      return <>{fallback}</>;
    }
    // If we're checking a write permission like products.edit,
    // we want to render the fields as disabled using a fieldset.
    return (
      <fieldset disabled className="w-full h-full opacity-90 cursor-not-allowed">
        <div className="pointer-events-none select-none">
          {children}
        </div>
      </fieldset>
    );
  }

  return <>{children}</>;
};
