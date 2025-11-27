"use client";

import { AppointmentResponse } from "@/modules/users/server/procedures";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppointmentCancelForm } from "@/modules/staff/ui/components/appointment-cancel-form";
import { Badge } from "@/components/ui/badge";

type AppointmentOperationSectionProps = {
    appointment: AppointmentResponse | null;
    activeTab: "details" | "cancel";
    onTabChangeAction: (tab: "details" | "cancel") => void;
}

export const AppointmentOperationSection = ({ appointment, activeTab, onTabChangeAction }: AppointmentOperationSectionProps) => {

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Randevu İşlemleri</CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs value={activeTab} onValueChange={(value) => onTabChangeAction(value as "details" | "cancel")} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="details" disabled={!appointment}>Detaylar</TabsTrigger>
                        <TabsTrigger value="cancel" disabled={!appointment || appointment.isCanceled || appointment.isCompleted}>İptal Et</TabsTrigger>
                    </TabsList>

                    <TabsContent value="details" className="mt-4">
                        {appointment ? (
                            <div className="space-y-4">
                                <div className="grid gap-2">
                                    <h3 className="text-sm font-medium leading-none">Müşteri</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {appointment.client?.firstname} {appointment.client?.lastname}
                                    </p>
                                    <p className="text-sm text-muted-foreground">{appointment.client?.email}</p>
                                    <p className="text-sm text-muted-foreground">{appointment.client?.phoneNumber || "-"}</p>
                                </div>
                                <div className="grid gap-2">
                                    <h3 className="text-sm font-medium leading-none">Tarih</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {new Date(appointment.appointmentDate).toLocaleString("tr-TR")}
                                    </p>
                                </div>
                                <div className="grid gap-2">
                                    <h3 className="text-sm font-medium leading-none">Durum</h3>
                                    <div>
                                        {appointment.isCanceled ? (
                                            <Badge variant="destructive">İptal Edildi</Badge>
                                        ) : appointment.isCompleted ? (
                                            <Badge variant="default" className="bg-green-600 hover:bg-green-700">Tamamlandı</Badge>
                                        ) : (
                                            <Badge variant="secondary">Bekliyor</Badge>
                                        )}
                                    </div>
                                </div>
                                {appointment.cancellationReason && (
                                    <div className="grid gap-2 p-2 bg-red-50 border border-red-100 rounded">
                                        <h3 className="text-sm font-medium leading-none text-red-800">İptal Nedeni</h3>
                                        <p className="text-sm text-red-600">{appointment.cancellationReason}</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground text-center p-4">
                                İşlem yapmak için bir randevu seçin.
                            </p>
                        )}
                    </TabsContent>

                    <TabsContent value="cancel" className="mt-4">
                        {appointment ? (
                            <AppointmentCancelForm
                                appointment={appointment}
                                onSuccessAction={() => onTabChangeAction("details")}
                            />
                        ) : (
                            <p className="text-sm text-muted-foreground text-center p-4">
                                İptal etmek için bir randevu seçin.
                            </p>
                        )}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
};