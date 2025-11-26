"use client";

import { useState } from 'react';
import { Role } from '@/modules/roles/server/procedures';
import { RoleListSection } from '@/modules/admin/ui/sections/role-list-section';
import { RoleOperationSection } from '@/modules/admin/ui/sections/role-operation-section';

export const RolesView = () => {
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [activeTab, setActiveTab] = useState<'create' | 'update'>('create');

    const handleRoleSelectAction = (role: Role) => {
        setSelectedRole(role);
        setActiveTab('update');
    };

    const handleTabChangeAction = (tab: 'create' | 'update') => {
        setActiveTab(tab);
        if (tab === 'create') {
            setSelectedRole(null);
        }
    };

    return (
        <div className="grid grid-cols-[1fr_400px] gap-4 p-4 h-full">
            <div className="col-span-1">
                <RoleListSection onRoleSelectAction={handleRoleSelectAction} />
            </div>
            <div className="col-span-1">
                <RoleOperationSection
                    role={selectedRole}
                    activeTab={activeTab}
                    onTabChangeAction={handleTabChangeAction}
                />
            </div>
        </div>
    );
};

