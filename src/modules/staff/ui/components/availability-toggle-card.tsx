"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { setStaffAvailability } from "@/modules/users/server/procedures";
import { userKeys } from "@/modules/users/server/queries";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type AvailabilityToggleCardProps = {
    salonId: string;
    isAvailable: boolean;
}

export const AvailabilityToggleCard = ({ salonId, isAvailable }: AvailabilityToggleCardProps) => {
    const queryClient = useQueryClient();
    const [available, setAvailable] = useState(isAvailable);

    const { mutate, isPending } = useMutation({
        mutationFn: (checked: boolean) => setStaffAvailability(salonId, { available: checked }),
        onSuccess: (_, checked) => {
            setAvailable(checked);
            toast.success(`Müsaitlik durumu ${checked ? 'açık' : 'kapalı'} olarak güncellendi.`);
            queryClient.invalidateQueries({ queryKey: userKeys.mySalons() });
        },
        onError: () => {
            toast.error("Müsaitlik durumu güncellenemedi.");
            setAvailable(!available); // Revert UI on error
        }
    });

    const handleToggle = (checked: boolean) => {
        setAvailable(checked);
        mutate(checked);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Müsaitlik Durumu</CardTitle>
                <CardDescription>
                    Genel randevu alımını buradan hızlıca açıp kapatabilirsiniz.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center space-x-2">
                    <Switch
                        id="availability-mode"
                        checked={available}
                        onCheckedChange={handleToggle}
                        disabled={isPending}
                    />
                    <Label htmlFor="availability-mode">
                        {available ? "Randevu Alımına AÇIK" : "Randevu Alımına KAPALI"}
                    </Label>
                </div>
            </CardContent>
        </Card>
    );
};