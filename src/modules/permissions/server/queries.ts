import { queryOptions } from '@tanstack/react-query';
import {
    getPermissionById,
    listPermissions
} from "@/modules/permissions/server/procedures";

// ----------------------------------------------------------------------
// 1. Query Key Factory
// ----------------------------------------------------------------------
export const permissionKeys = {
    all: ['permissions'] as const,
    lists: () => [...permissionKeys.all, 'list'] as const,
    detail: (id: string) => [...permissionKeys.all, 'detail', id] as const,
    creates: () => [...permissionKeys.all, 'create'] as const,
    updates: () => [...permissionKeys.all, 'update'] as const,
    deletes: () => [...permissionKeys.all, 'delete'] as const,
};

// ----------------------------------------------------------------------
// 2. Query Options Factory
// ----------------------------------------------------------------------
export const permissionQueries = {
    list: () => queryOptions({
        queryKey: permissionKeys.lists(),
        queryFn: () => listPermissions(),
    }),
    getOne: (id: string) => queryOptions({
        queryKey: permissionKeys.detail(id),
        queryFn: () => getPermissionById(id),
    }),
};
