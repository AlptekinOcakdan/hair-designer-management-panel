"use client";

import { Suspense, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { roleKeys, roleQueries } from "@/modules/roles/server/queries";
import { DataTable } from "@/components/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { deleteRole, Role } from "@/modules/roles/server/procedures";
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

type RoleListSectionProps = {
    onRoleSelectAction: (role: Role) => void;
}

export const RoleListSection = (props: RoleListSectionProps) => {
    return (
        <Suspense fallback={<RoleListSectionSkeleton />}>
            <ErrorBoundary fallback={<p>Error loading roles.</p>}>
                <RoleListSectionSuspense {...props} />
            </ErrorBoundary>
        </Suspense>
    );
};

const RoleListSectionSkeleton = () => {
    return (
        <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
        </div>
    );
}

const RoleListSectionSuspense = ({ onRoleSelectAction }: RoleListSectionProps) => {
    const queryClient = useQueryClient();
    const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
    const { data: roles } = useSuspenseQuery(roleQueries.list());

    const { mutate: deleteMutate, isPending: isDeleting } = useMutation({
        mutationFn: deleteRole,
        onSuccess: async () => {
            toast.success("Role deleted successfully.");
            await queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
            setRoleToDelete(null);
        },
        onError: (error) => {
            toast.error(error.message || "Failed to delete role.");
            setRoleToDelete(null);
        }
    });

    const columns: ColumnDef<Role>[] = [
        {
            accessorKey: "role",
            header: "Rol Adı",
        },
        {
            accessorKey: "createdAt",
            header: "Oluşturulma Tarihi",
            cell: ({ row }) => {
                const date = new Date(row.getValue("createdAt"));
                return <span>{date.toLocaleDateString()}</span>;
            },
        },
        {
            id: "actions",
            header: () => <div className="text-right">Eylemler</div>,
            cell: ({ row }) => {
                const role = row.original;
                return (
                    <div className="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onRoleSelectAction(role)}
                        >
                            Güncelle
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                setRoleToDelete(role);
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
                data={roles}
                onRowClick={(role) => onRoleSelectAction(role)}
            />
            <AlertDialog open={!!roleToDelete} onOpenChange={(open) => !open && setRoleToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the
                            role &quot;{roleToDelete?.role}&quot;.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            disabled={isDeleting}
                            onClick={() => {
                                if (roleToDelete) {
                                    deleteMutate(roleToDelete.id);
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
