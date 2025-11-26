"use client";

import { Suspense, useState } from 'react';
import { Salon } from '@/modules/salons/server/procedures';
import { SalonListSection } from '@/modules/manager/ui/sections/salon-list-section';
import { SalonOperationSection } from '@/modules/manager/ui/sections/salon-operation-section';
import { useSuspenseQuery } from '@tanstack/react-query';
import { organisationQueries } from '@/modules/organisations/server/queries';

const SalonsViewSuspense = () => {
    const [selectedSalon, setSelectedSalon] = useState<Salon | null>(null);
    const [activeTab, setActiveTab] = useState<'create' | 'update'>('create');

    const { data: organisations } = useSuspenseQuery(organisationQueries.listMine());
    const organisationId = organisations?.[0]?.id;

    const handleSalonSelectAction = (salon: Salon) => {
        setSelectedSalon(salon);
        setActiveTab('update');
    };

    const handleTabChangeAction = (tab: 'create' | 'update') => {
        setActiveTab(tab);
        if (tab === 'create') {
            setSelectedSalon(null);
        }
    };

    return (
        <div className="grid grid-cols-[1fr_400px] gap-4 p-4 h-full">
            <div className="col-span-1">
                <SalonListSection onSalonSelectAction={handleSalonSelectAction} />
            </div>
            <div className="col-span-1">
                <SalonOperationSection
                    salon={selectedSalon}
                    activeTab={activeTab}
                    onTabChangeAction={handleTabChangeAction}
                    organisationId={organisationId}
                />
            </div>
        </div>
    );
}

export const SalonsView = () => {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SalonsViewSuspense />
        </Suspense>
    )
};
