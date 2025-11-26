"use client";

import {Suspense, useState} from "react";
import {ErrorBoundary} from "react-error-boundary";
import {useMutation, useQueryClient, useSuspenseQuery} from "@tanstack/react-query";
import {organisationKeys, organisationQueries} from "@/modules/organisations/server/queries";
import {DataTable} from "@/components/data-table";
import {ColumnDef} from "@tanstack/react-table";
import {deleteOrganisation, Organisation} from "@/modules/organisations/server/procedures";
import {Skeleton} from "@/components/ui/skeleton";
import {Button} from "@/components/ui/button";
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
import {toast} from "sonner";
import {userQueries} from "@/modules/users/server/queries";
import {User} from "@/modules/users/server/procedures";

type OrganisationListSectionProps = {}

export const OrganisationListSection = (props: OrganisationListSectionProps) => {
    return (
        <Suspense fallback={<OrganisationListSectionSkeleton/>}>
            <ErrorBoundary fallback={<p>Error loading organisations.</p>}>
                <OrganisationListSectionSuspense />
            </ErrorBoundary>
        </Suspense>
    );
};

const OrganisationListSectionSkeleton = () => {
    return (
        <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
        </div>
    );
}

const OrganisationListSectionSuspense = () => {
    const queryClient = useQueryClient();
    const [organisationToDelete, setOrganisationToDelete] = useState<Organisation | null>(null);
    const { data: organisations } = useSuspenseQuery(organisationQueries.list());
    const { data: users } = useSuspenseQuery(userQueries.list());

    const userMap = new Map<string, User>(users.map(user => [user.id, user]));

    const { mutate: deleteMutate, isPending: isDeleting } = useMutation({
        mutationFn: deleteOrganisation,
        onSuccess: async () => {
            toast.success("Organisation deleted successfully.");
            await queryClient.invalidateQueries({ queryKey: organisationKeys.lists() });
            setOrganisationToDelete(null);
        },
        onError: (error) => {
            toast.error(error.message || "Failed to delete organisation.");
            setOrganisationToDelete(null);
        }
    });

    const columns: ColumnDef<Organisation>[] = [
        {
            accessorKey: "name",
            header: "Organizasyon Adı",
        },
        {
            accessorKey: "userId",
            header: "Kullanıcı",
            cell: ({ row }) => {
                const user = userMap.get(row.original.userId);
                return user ? `${user.firstname} ${user.lastname}` : 'N/A';
            }
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
                const organisation = row.original;
                return (
                    <div className="flex justify-end">
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                setOrganisationToDelete(organisation);
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
                data={organisations}
            />
            <AlertDialog open={!!organisationToDelete} onOpenChange={(open) => !open && setOrganisationToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the
                            organisation &quot;{organisationToDelete?.name}&quot;.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            disabled={isDeleting}
                            onClick={() => {
                                if (organisationToDelete) {
                                    deleteMutate(organisationToDelete.id);
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