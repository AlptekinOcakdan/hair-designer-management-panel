"use client";

import { Suspense, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { userKeys, userQueries } from "@/modules/users/server/queries";
import { DataTable } from "@/components/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { deleteMyProcedure, StaffProcedureDetail } from "@/modules/users/server/procedures";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { IconPencil, IconTrash } from "@tabler/icons-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@/components/ui/alert-dialog";

type ProcedureListSectionProps = {
    onProcedureSelectAction: (procedure: StaffProcedureDetail) => void;
}

export const ProcedureListSection = (props: ProcedureListSectionProps) => {
    return (
        <Suspense fallback={<ProcedureListSectionSkeleton />}>
            <ErrorBoundary fallback={<p>Prosedürler yüklenirken hata oluştu.</p>}>
                <ProcedureListSectionSuspense {...props} />
            </ErrorBoundary>
        </Suspense>
    );
};

const ProcedureListSectionSkeleton = () => {
    return (
        <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
        </div>
    );
}

const ProcedureListSectionSuspense = ({ onProcedureSelectAction }: ProcedureListSectionProps) => {
    const queryClient = useQueryClient();
    const [procedureToDelete, setProcedureToDelete] = useState<StaffProcedureDetail | null>(null);

    const { data: procedures } = useSuspenseQuery(userQueries.listMyProcedures());

    const { mutate: deleteMutate, isPending: isDeleting } = useMutation({
        mutationFn: deleteMyProcedure,
        onSuccess: async () => {
            toast.success("Prosedür silindi.");
            await queryClient.invalidateQueries({ queryKey: userKeys.myProcedures() });
            setProcedureToDelete(null);
        },
        onError: (error) => {
            toast.error(error.message || "Silme işlemi başarısız.");
            setProcedureToDelete(null);
        }
    });

    const columns: ColumnDef<StaffProcedureDetail>[] = [
        {
            accessorKey: "procedureName",
            header: "Prosedür Adı",
        },
        {
            accessorKey: "duration",
            header: "Süre (dk)",
            cell: ({ row }) => <span className="font-medium">{row.original.duration} dk</span>
        },
        {
            accessorKey: "price",
            header: "Fiyat",
            cell: ({ row }) => <span>{row.original.price} TL</span>
        },
        {
            id: "actions",
            header: () => <div className="text-right">Eylemler</div>,
            cell: ({ row }) => {
                const proc = row.original;
                return (
                    <div className="flex justify-end gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-muted"
                            title="Güncelle"
                            onClick={() => onProcedureSelectAction(proc)}
                        >
                            <IconPencil className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            title="Sil"
                            onClick={(e) => {
                                e.stopPropagation();
                                setProcedureToDelete(proc);
                            }}
                        >
                            <IconTrash className="h-4 w-4" />
                        </Button>
                    </div>
                );
            },
        }
    ];

    return (
        <>
            <DataTable
                columns={columns}
                data={procedures || []}
            />
            <AlertDialog open={!!procedureToDelete} onOpenChange={(open) => !open && setProcedureToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
                        <AlertDialogDescription>
                            "{procedureToDelete?.procedureName}" prosedürünü listenizden çıkarmak üzeresiniz. Bu işlem geri alınamaz.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>İptal</AlertDialogCancel>
                        <AlertDialogAction
                            disabled={isDeleting}
                            onClick={() => {
                                if (procedureToDelete) {
                                    deleteMutate(procedureToDelete.procedureId);
                                }
                            }}
                        >
                            {isDeleting ? "Siliniyor..." : "Sil"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}