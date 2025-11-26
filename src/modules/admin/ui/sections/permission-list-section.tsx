"use client";

import { Suspense, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { permissionKeys, permissionQueries } from "@/modules/permissions/server/queries";
import { DataTable } from "@/components/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { deletePermission, Permission } from "@/modules/permissions/server/procedures";
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

type PermissionListSectionProps = {
    onPermissionSelectAction: (permission: Permission) => void;
}

export const PermissionListSection = (props: PermissionListSectionProps) => {
    return (
        <Suspense fallback={<PermissionListSectionSkeleton />}>
            <ErrorBoundary fallback={<p>Error loading permissions.</p>}>
                <PermissionListSectionSuspense {...props} />
            </ErrorBoundary>
        </Suspense>
    );
};

const PermissionListSectionSkeleton = () => {
    return (
        <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
        </div>
    );
}

const PermissionListSectionSuspense = ({ onPermissionSelectAction }: PermissionListSectionProps) => {
    const queryClient = useQueryClient();
    const [permissionToDelete, setPermissionToDelete] = useState<Permission | null>(null);
    const { data: permissions } = useSuspenseQuery(permissionQueries.list());

    const { mutate: deleteMutate, isPending: isDeleting } = useMutation({
        mutationFn: deletePermission,
        onSuccess: async () => {
            toast.success("Permission deleted successfully.");
            await queryClient.invalidateQueries({ queryKey: permissionKeys.lists() });
            setPermissionToDelete(null);
        },
        onError: (error) => {
            toast.error(error.message || "Failed to delete permission.");
            setPermissionToDelete(null);
        }
    });

    const columns: ColumnDef<Permission>[] = [
        {
            accessorKey: "action",
            header: "Yetki",
        },
        {
            accessorKey: "description",
            header: "Açıklama",
        },
        {
            id: "actions",
            header: () => <div className="text-right">Eylemler</div>,
            cell: ({ row }) => {
                const permission = row.original;
                return (
                    <div className="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPermissionSelectAction(permission)}
                        >
                            Güncelle
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                setPermissionToDelete(permission);
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
                data={permissions}
                onRowClick={(permission) => onPermissionSelectAction(permission)}
            />
            <AlertDialog open={!!permissionToDelete} onOpenChange={(open) => !open && setPermissionToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the
                            permission &quot;{permissionToDelete?.action}&quot;.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            disabled={isDeleting}
                            onClick={() => {
                                if (permissionToDelete) {
                                    deleteMutate(permissionToDelete.id);
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

