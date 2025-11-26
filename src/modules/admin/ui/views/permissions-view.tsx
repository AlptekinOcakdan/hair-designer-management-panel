"use client";

import { useState } from 'react';
import { Permission } from '@/modules/permissions/server/procedures';
import { PermissionListSection } from '@/modules/admin/ui/sections/permission-list-section';
import { PermissionOperationSection } from '@/modules/admin/ui/sections/permission-operation-section';

export const PermissionsView = () => {
    const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);
    const [activeTab, setActiveTab] = useState<'create' | 'update'>('create');

    const handlePermissionSelectAction = (permission: Permission) => {
        setSelectedPermission(permission);
        setActiveTab('update');
    };

    const handleTabChangeAction = (tab: 'create' | 'update') => {
        setActiveTab(tab);
        if (tab === 'create') {
            setSelectedPermission(null);
        }
    };

    return (
        <div className="grid grid-cols-[1fr_400px] gap-4 p-4 h-full">
            <div className="col-span-1">
                <PermissionListSection onPermissionSelectAction={handlePermissionSelectAction} />
            </div>
            <div className="col-span-1">
                <PermissionOperationSection
                    permission={selectedPermission}
                    activeTab={activeTab}
                    onTabChangeAction={handleTabChangeAction}
                />
            </div>
        </div>
    );
};

