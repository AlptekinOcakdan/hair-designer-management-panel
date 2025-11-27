"use client";

import { Suspense, useState, useEffect } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { userQueries } from '@/modules/users/server/queries';
import { AvailabilityToggleCard } from '@/modules/staff/ui/components/availability-toggle-card';
import { WorkingScheduleCard } from '@/modules/staff/ui/components/working-schedule-card';
import { NonAvailabilityCard } from '@/modules/staff/ui/components/non-availability-card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

const AvailabilityViewSuspense = () => {
    const { data: salons } = useSuspenseQuery(userQueries.listMySalons());
    const [selectedSalonId, setSelectedSalonId] = useState<string>("");

    useEffect(() => {
        if (salons && salons.length > 0 && !selectedSalonId) {
            setSelectedSalonId(salons[0].salonId);
        }
    }, [salons, selectedSalonId]);

    if (!salons || salons.length === 0) {
        return (
            <div className="p-4">
                <Card>
                    <CardContent className="p-6 text-center text-muted-foreground">
                        Herhangi bir salona atanmış görünmüyorsunuz. Lütfen yöneticinizle iletişime geçin.
                    </CardContent>
                </Card>
            </div>
        );
    }

    const currentSettings = salons.find(s => s.salonId === selectedSalonId);

    return (
        <div className="p-4 space-y-6 max-w-4xl mx-auto">
            {salons.length > 1 && (
                <div className="w-full max-w-xs">
                    <label className="text-sm font-medium mb-1 block">Salon Seçimi</label>
                    <Select value={selectedSalonId} onValueChange={setSelectedSalonId}>
                        <SelectTrigger>
                            <SelectValue placeholder="Salon seçin" />
                        </SelectTrigger>
                        <SelectContent>
                            {salons.map(s => (
                                <SelectItem key={s.salonId} value={s.salonId}>{s.salonName}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}

            {currentSettings && (
                <>
                    <AvailabilityToggleCard
                        salonId={selectedSalonId}
                        isAvailable={currentSettings.avalaibleForAppointments}
                    />

                    <WorkingScheduleCard
                        salonId={selectedSalonId}
                        currentWeekDays={currentSettings.availableWeekDays}
                        currentHours={currentSettings.availableHours}
                    />

                    <NonAvailabilityCard
                        salonId={selectedSalonId}
                    />
                </>
            )}
        </div>
    );
}

export const AvailabilityView = () => {
    return (
        <Suspense fallback={<div className="p-8 text-center">Yükleniyor...</div>}>
            <AvailabilityViewSuspense />
        </Suspense>
    )
};