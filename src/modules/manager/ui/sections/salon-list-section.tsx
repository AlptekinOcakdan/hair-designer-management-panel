"use client";

import { Suspense, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { salonKeys, salonQueries } from "@/modules/salons/server/queries";
import { DataTable } from "@/components/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { deleteSalon, Salon } from "@/modules/salons/server/procedures";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
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
import { toast } from "sonner";
import { organisationQueries } from "@/modules/organisations/server/queries";

type SalonListSectionProps = {
    onSalonSelectAction: (salon: Salon) => void;
}

export const SalonListSection = (props: SalonListSectionProps) => {
    return (
        <Suspense fallback={<SalonListSectionSkeleton />}>
            <ErrorBoundary fallback={<p>Error loading salons.</p>}>
                <SalonListSectionSuspense {...props} />
            </ErrorBoundary>
        </Suspense>
    );
};

const SalonListSectionSkeleton = () => {
    return (
        <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
        </div>
    );
}

const SalonListSectionSuspense = ({ onSalonSelectAction }: SalonListSectionProps) => {
    const { data: organisations } = useSuspenseQuery(organisationQueries.listMine());
    const organisationId = organisations?.[0]?.id;

    if (!organisationId) {
        return <p className="text-center text-muted-foreground p-4">No organisation found to list salons.</p>;
    }

    return <SalonListContent organisationId={organisationId} onSalonSelectAction={onSalonSelectAction} />;
}

type SalonListContentProps = {
    organisationId: string;
    onSalonSelectAction: (salon: Salon) => void;
}

const SalonListContent = ({ organisationId, onSalonSelectAction }: SalonListContentProps) => {
    const queryClient = useQueryClient();
    const [salonToDelete, setSalonToDelete] = useState<Salon | null>(null);

    const { data: salons } = useSuspenseQuery(salonQueries.listByOrganisation(organisationId));

    const { mutate: deleteMutate, isPending: isDeleting } = useMutation({
        mutationFn: deleteSalon,
        onSuccess: async () => {
            toast.success("Salon deleted successfully.");
            await queryClient.invalidateQueries({ queryKey: salonKeys.byOrganisation(organisationId) });
            setSalonToDelete(null);
        },
        onError: (error) => {
            toast.error(error.message || "Failed to delete salon.");
            setSalonToDelete(null);
        }
    });

    const columns: ColumnDef<Salon>[] = [
        {
            accessorKey: "name",
            header: "Salon Adı",
        },
        {
            accessorKey: "location",
            header: "Konum",
        },
        {
            id: "actions",
            header: () => <div className="text-right">Eylemler</div>,
            cell: ({ row }) => {
                const salon = row.original;
                return (
                    <div className="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onSalonSelectAction(salon)}
                        >
                            Güncelle
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                setSalonToDelete(salon);
                            }}
                        >
                            Sil
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
                data={salons || []}
                onRowClick={(salon) => onSalonSelectAction(salon)}
            />
            <AlertDialog open={!!salonToDelete} onOpenChange={(open) => !open && setSalonToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the
                            salon &quot;{salonToDelete?.name}&quot;.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            disabled={isDeleting}
                            onClick={() => {
                                if (salonToDelete) {
                                    deleteMutate(salonToDelete.id);
                                }
                            }}
                        >
                            {isDeleting ? "Deleting..." : "Continue"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
