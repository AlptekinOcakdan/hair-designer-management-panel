import { queryOptions } from '@tanstack/react-query';
import {
    getProcedureById,
    listProcedures
} from "@/modules/procedures/server/procedures";

// ----------------------------------------------------------------------
// 1. Query Key Factory
// ----------------------------------------------------------------------
export const procedureKeys = {
    all: ['procedures'] as const,
    lists: () => [...procedureKeys.all, 'list'] as const,
    detail: (id: string) => [...procedureKeys.all, 'detail', id] as const,
};

// ----------------------------------------------------------------------
// 2. Query Options Factory
// ----------------------------------------------------------------------
export const procedureQueries = {
    list: () => queryOptions({
        queryKey: procedureKeys.lists(),
        queryFn: () => listProcedures(),
    }),
    getOne: (id: string) => queryOptions({
        queryKey: procedureKeys.detail(id),
        queryFn: () => getProcedureById(id),
    }),
};

