"use client";

import { Suspense, useState } from 'react';
import { OrganisationUser } from '@/modules/users/server/procedures';
import { EmployeeListSection } from '@/modules/manager/ui/sections/employee-list-section';
import { EmployeeOperationSection } from '@/modules/manager/ui/sections/employee-operation-section';
import { useSuspenseQuery } from '@tanstack/react-query';
import { organisationQueries } from '@/modules/organisations/server/queries';

const EmployeesViewSuspense = () => {
    const [selectedEmployee, setSelectedEmployee] = useState<OrganisationUser | null>(null);
    const [activeTab, setActiveTab] = useState<'create' | 'assign'>('create');

    const { data: organisations } = useSuspenseQuery(organisationQueries.listMine());
    const organisationId = organisations?.[0]?.id;

    const handleEmployeeAssignAction = (employee: OrganisationUser) => {
        setSelectedEmployee(employee);
        setActiveTab('assign');
    };

    const handleTabChangeAction = (tab: 'create' | 'assign') => {
        setActiveTab(tab);
        if (tab === 'create') {
            setSelectedEmployee(null);
        }
    };

    return (
        <div className="grid grid-cols-[1fr_400px] gap-4 p-4 h-full">
            <div className="col-span-1">
                <EmployeeListSection
                    onEmployeeAssignAction={handleEmployeeAssignAction}
                />
            </div>
            <div className="col-span-1">
                <EmployeeOperationSection
                    employee={selectedEmployee}
                    activeTab={activeTab}
                    onTabChangeAction={handleTabChangeAction}
                    organisationId={organisationId}
                />
            </div>
        </div>
    );
}

export const EmployeesView = () => {
    return (
        <Suspense fallback={<div className="p-4">Loading...</div>}>
            <EmployeesViewSuspense />
        </Suspense>
    )
};