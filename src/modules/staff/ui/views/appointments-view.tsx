"use client";

import { Suspense, useState } from 'react';
import { AppointmentResponse } from '@/modules/users/server/procedures';
import { AppointmentListSection } from '@/modules/staff/ui/sections/appointment-list-section';
import { AppointmentOperationSection } from '@/modules/staff/ui/sections/appointment-operation-section';

const AppointmentsViewSuspense = () => {
    const [selectedAppointment, setSelectedAppointment] = useState<AppointmentResponse | null>(null);
    const [activeTab, setActiveTab] = useState<'details' | 'cancel'>('details');

    const handleAppointmentSelectAction = (appointment: AppointmentResponse) => {
        setSelectedAppointment(appointment);
        setActiveTab('details');
    };

    const handleAppointmentCancelAction = (appointment: AppointmentResponse) => {
        setSelectedAppointment(appointment);
        setActiveTab('cancel');
    };

    const handleTabChangeAction = (tab: 'details' | 'cancel') => {
        setActiveTab(tab);
    };

    return (
        <div className="grid grid-cols-[1fr_400px] gap-4 p-4 h-full">
            <div className="col-span-1">
                <AppointmentListSection
                    onAppointmentSelectAction={handleAppointmentSelectAction}
                    onAppointmentCancelAction={handleAppointmentCancelAction}
                />
            </div>
            <div className="col-span-1">
                <AppointmentOperationSection
                    appointment={selectedAppointment}
                    activeTab={activeTab}
                    onTabChangeAction={handleTabChangeAction}
                />
            </div>
        </div>
    );
}

export const AppointmentsView = () => {
    return (
        <Suspense fallback={<div className="p-4">Loading...</div>}>
            <AppointmentsViewSuspense />
        </Suspense>
    )
};