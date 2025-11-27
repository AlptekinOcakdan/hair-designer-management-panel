"use client";

import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { userKeys, userQueries } from "@/modules/users/server/queries";
import { DataTable } from "@/components/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { AppointmentResponse, completeAppointment } from "@/modules/users/server/procedures";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { IconCheck, IconX } from "@tabler/icons-react";

type AppointmentListSectionProps = {
    onAppointmentSelectAction: (appointment: AppointmentResponse) => void;
    onAppointmentCancelAction: (appointment: AppointmentResponse) => void;
}

export const AppointmentListSection = (props: AppointmentListSectionProps) => {
    return (
        <Suspense fallback={<AppointmentListSectionSkeleton />}>
            <ErrorBoundary fallback={<p>Randevular yüklenirken hata oluştu.</p>}>
                <AppointmentListSectionSuspense {...props} />
            </ErrorBoundary>
        </Suspense>
    );
};

const AppointmentListSectionSkeleton = () => {
    return (
        <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
        </div>
    );
}

const AppointmentListSectionSuspense = ({ onAppointmentSelectAction, onAppointmentCancelAction }: AppointmentListSectionProps) => {
    const queryClient = useQueryClient();

    // Varsayılan olarak tüm randevuları çekiyoruz, tarih filtresi eklenebilir.
    const { data: appointments } = useSuspenseQuery(userQueries.listStaffAppointments());

    const { mutate: completeMutate, isPending: isCompleting } = useMutation({
        mutationFn: (vars: { id: string, staffId: string }) => completeAppointment(vars.id, { staffId: vars.staffId }),
        onSuccess: async () => {
            toast.success("Randevu tamamlandı olarak işaretlendi.");
            await queryClient.invalidateQueries({ queryKey: userKeys.staffAppointments() });
        },
        onError: (error) => {
            toast.error(error.message || "İşlem başarısız.");
        }
    });

    const columns: ColumnDef<AppointmentResponse>[] = [
        {
            accessorKey: "appointmentDate",
            header: "Tarih/Saat",
            cell: ({ row }) => {
                const date = new Date(row.original.appointmentDate);
                return (
                    <div className="flex flex-col">
                        <span className="font-medium">{date.toLocaleDateString("tr-TR")}</span>
                        <span className="text-xs text-muted-foreground">{date.toLocaleTimeString("tr-TR", { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                );
            },
        },
        {
            accessorKey: "client",
            header: "Müşteri",
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span>{row.original.client?.firstname} {row.original.client?.lastname}</span>
                    <span className="text-xs text-muted-foreground">{row.original.client?.phoneNumber}</span>
                </div>
            ),
        },
        {
            accessorKey: "status",
            header: "Durum",
            cell: ({ row }) => {
                if (row.original.isCanceled) return <Badge variant="destructive">İptal</Badge>;
                if (row.original.isCompleted) return <Badge variant="default" className="bg-green-600">Tamamlandı</Badge>;
                return <Badge variant="secondary">Bekliyor</Badge>;
            },
        },
        {
            id: "actions",
            header: () => <div className="text-right">Eylemler</div>,
            cell: ({ row }) => {
                const appt = row.original;
                const isActionable = !appt.isCanceled && !appt.isCompleted;

                return (
                    <div className="flex justify-end gap-2">
                        {isActionable && (
                            <>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                    title="Tamamla"
                                    disabled={isCompleting}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        completeMutate({ id: appt.id, staffId: appt.staffId });
                                    }}
                                >
                                    <IconCheck className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                    title="İptal Et"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onAppointmentCancelAction(appt);
                                    }}
                                >
                                    <IconX className="h-4 w-4" />
                                </Button>
                            </>
                        )}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onAppointmentSelectAction(appt)}
                        >
                            Detay
                        </Button>
                    </div>
                );
            },
        }
    ];

    return (
        <DataTable
            columns={columns}
            data={appointments || []}
            // Satıra tıklayınca detay açılabilir
            // onRowClick={(appt) => onAppointmentSelectAction(appt)}
        />
    );
}