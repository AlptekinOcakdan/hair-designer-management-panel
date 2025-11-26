"use client";

import { Suspense, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { userKeys, userQueries } from "@/modules/users/server/queries";
import { DataTable } from "@/components/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { deleteUser, OrganisationUser } from "@/modules/users/server/procedures";
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
import { Badge } from "@/components/ui/badge";

type EmployeeListSectionProps = {
    onEmployeeAssignAction: (employee: OrganisationUser) => void;
}

export const EmployeeListSection = (props: EmployeeListSectionProps) => {
    return (
        <Suspense fallback={<EmployeeListSectionSkeleton />}>
            <ErrorBoundary fallback={<p>Error loading employees.</p>}>
                <EmployeeListSectionSuspense {...props} />
            </ErrorBoundary>
        </Suspense>
    );
};

const EmployeeListSectionSkeleton = () => {
    return (
        <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
        </div>
    );
}

const EmployeeListSectionSuspense = ({ onEmployeeAssignAction }: EmployeeListSectionProps) => {
    const { data: organisations } = useSuspenseQuery(organisationQueries.listMine());
    const organisationId = organisations?.[0]?.id;

    if (!organisationId) {
        return <p className="text-center text-muted-foreground p-4">No organisation found to list employees.</p>;
    }

    return <EmployeeListContent organisationId={organisationId} onEmployeeAssignAction={onEmployeeAssignAction} />;
}

type EmployeeListContentProps = {
    organisationId: string;
    onEmployeeAssignAction: (employee: OrganisationUser) => void;
}

const EmployeeListContent = ({ organisationId, onEmployeeAssignAction }: EmployeeListContentProps) => {
    const queryClient = useQueryClient();
    const [employeeToDelete, setEmployeeToDelete] = useState<OrganisationUser | null>(null);

    const { data: employees } = useSuspenseQuery(userQueries.listByOrganisation(organisationId));

    const { mutate: deleteMutate, isPending: isDeleting } = useMutation({
        mutationFn: deleteUser,
        onSuccess: async () => {
            toast.success("Employee deleted successfully.");
            await queryClient.invalidateQueries({ queryKey: userKeys.byOrganisation(organisationId) });
            setEmployeeToDelete(null);
        },
        onError: (error) => {
            toast.error(error.message || "Failed to delete employee.");
            setEmployeeToDelete(null);
        }
    });

    const columns: ColumnDef<OrganisationUser>[] = [
        {
            accessorKey: "user.firstname",
            header: "Ad Soyad",
            cell: ({ row }) => `${row.original.user.firstname} ${row.original.user.lastname}`,
        },
        {
            accessorKey: "user.email",
            header: "E-posta",
        },
        {
            accessorKey: "salon.name",
            header: "Salon",
            cell: ({ row }) => row.original.salon?.name || "-",
        },
        {
            accessorKey: "roles",
            header: "Roller",
            cell: ({ row }) => (
                <div className="flex gap-1 flex-wrap">
                    {row.original.roles.map((role, index) => <Badge key={`${role.id}-${index}`} variant="outline">{role.name}</Badge>)}
                </div>
            ),
        },
        {
            id: "actions",
            header: () => <div className="text-right">Eylemler</div>,
            cell: ({ row }) => {
                const employee = row.original;
                return (
                    <div className="flex justify-end gap-2">
                        <Button
                            variant="default"
                            size="sm"
                            onClick={() => onEmployeeAssignAction(employee)}
                        >
                            Ata
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                setEmployeeToDelete(employee);
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
                data={employees || []}
            />
            <AlertDialog open={!!employeeToDelete} onOpenChange={(open) => !open && setEmployeeToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the
                            employee &quot;{employeeToDelete?.user.firstname} {employeeToDelete?.user.lastname}&quot;.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            disabled={isDeleting}
                            onClick={() => {
                                if (employeeToDelete) {
                                    deleteMutate(employeeToDelete.user.id);
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