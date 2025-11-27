"use client";

import { Suspense, useState } from 'react';
import { StaffProcedureDetail } from '@/modules/users/server/procedures';
import { ProcedureListSection } from '@/modules/staff/ui/sections/procedure-list-section';
import { ProcedureOperationSection } from '@/modules/staff/ui/sections/procedure-operation-section';

const ProceduresViewSuspense = () => {
    const [selectedProcedure, setSelectedProcedure] = useState<StaffProcedureDetail | null>(null);
    const [activeTab, setActiveTab] = useState<'create' | 'update'>('create');

    // Bu örnekte staffId'yi prop olarak geçmiyoruz çünkü backend token'dan alacak şekilde
    // controller'ı ayarladık (Add işlemi için de ayarlamalıyız, yukarıdaki kodda düzeltme yapacağım).

    const handleProcedureSelectAction = (procedure: StaffProcedureDetail) => {
        setSelectedProcedure(procedure);
        setActiveTab('update');
    };

    const handleTabChangeAction = (tab: 'create' | 'update') => {
        setActiveTab(tab);
        if (tab === 'create') {
            setSelectedProcedure(null);
        }
    };

    return (
        <div className="grid grid-cols-[1fr_400px] gap-4 p-4 h-full">
            <div className="col-span-1">
                <ProcedureListSection
                    onProcedureSelectAction={handleProcedureSelectAction}
                />
            </div>
            <div className="col-span-1">
                <ProcedureOperationSection
                    selectedProcedure={selectedProcedure}
                    activeTab={activeTab}
                    onTabChangeAction={handleTabChangeAction}
                    staffId={""} // Backend token'dan alacağı için boş bırakılabilir veya kaldırılabilir
                />
            </div>
        </div>
    );
}

export const ProceduresView = () => {
    return (
        <Suspense fallback={<div className="p-4">Loading...</div>}>
            <ProceduresViewSuspense />
        </Suspense>
    )
};