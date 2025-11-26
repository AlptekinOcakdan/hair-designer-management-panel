"use client";

import {Suspense, useState} from "react";
import {ErrorBoundary} from "react-error-boundary";
import {useMutation, useQueryClient, useSuspenseQuery} from "@tanstack/react-query";
import {userKeys, userQueries} from "@/modules/users/server/queries";
import {DataTable} from "@/components/data-table";
import {ColumnDef} from "@tanstack/react-table";
import {deleteUser, User} from "@/modules/users/server/procedures";
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

type UsersListSectionProps = {
    onUserSelectAction: (user: User) => void;
    onUserAssignAction: (user: User) => void;
    onUserAuthorizeAction: (user: User) => void;
}

export const UsersListSection = (props: UsersListSectionProps) => {
    return (
        <Suspense fallback={<UsersListSectionSkeleton/>}>
            <ErrorBoundary fallback={<p>Error loading users.</p>}>
                <UsersListSectionSuspense {...props} />
            </ErrorBoundary>
        </Suspense>
    );
};

const UsersListSectionSkeleton = () => {
    return (
        <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
        </div>
    );
}

const UsersListSectionSuspense = ({ onUserSelectAction, onUserAssignAction, onUserAuthorizeAction }: UsersListSectionProps) => {
    const queryClient = useQueryClient();
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const { data: users } = useSuspenseQuery(userQueries.list());

    const { mutate: deleteMutate, isPending: isDeleting } = useMutation({
        mutationFn: deleteUser,
        onSuccess: async () => {
            toast.success("User deleted successfully.");
            await queryClient.invalidateQueries({ queryKey: userKeys.lists() });
            setUserToDelete(null);
        },
        onError: (error) => {
            toast.error(error.message || "Failed to delete user.");
            setUserToDelete(null);
        }
    });

    const columns: ColumnDef<User>[] = [
        {
            accessorKey: "firstname",
            header: "Ad",
        },
        {
            accessorKey: "lastname",
            header: "Soyad",
        },
        {
            accessorKey: "email",
            header: "Email",
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
                const user = row.original;
                return (
                    <div className="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                onUserSelectAction(user);
                            }}
                        >
                            Güncelle
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                onUserAssignAction(user);
                            }}
                        >
                            Ata
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                onUserAuthorizeAction(user);
                            }}
                        >
                            Yetkilendir
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                setUserToDelete(user);
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
                data={users}
            />
            <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the
                            user &quot;{userToDelete?.firstname} {userToDelete?.lastname}&quot;.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            disabled={isDeleting}
                            onClick={() => {
                                if (userToDelete) {
                                    deleteMutate(userToDelete.id);
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
