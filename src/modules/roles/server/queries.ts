import { queryOptions } from '@tanstack/react-query';
import {
    getRoleById,
    listRoles
} from "@/modules/roles/server/procedures";

// ----------------------------------------------------------------------
// 1. Query Key Factory
// ----------------------------------------------------------------------
export const roleKeys = {
    all: ['roles'] as const,
    lists: () => [...roleKeys.all, 'list'] as const,
    detail: (id: string) => [...roleKeys.all, 'detail', id] as const,
    creates: () => [...roleKeys.all, 'create'] as const,
    updates: () => [...roleKeys.all, 'update'] as const,
    deletes: () => [...roleKeys.all, 'delete'] as const,
};

// ----------------------------------------------------------------------
// 2. Query Options Factory
// ----------------------------------------------------------------------
export const roleQueries = {
    list: () => queryOptions({
        queryKey: roleKeys.lists(),
        queryFn: () => listRoles(),
    }),
    getOne: (id: string) => queryOptions({
        queryKey: roleKeys.detail(id),
        queryFn: () => getRoleById(id),
    }),
};
