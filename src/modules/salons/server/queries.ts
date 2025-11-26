import { queryOptions } from '@tanstack/react-query';
import {
    getSalonById,
    getSalonsByOrganisation,
    listSalons
} from "@/modules/salons/server/procedures";

// ----------------------------------------------------------------------
// 1. Query Key Factory
// ----------------------------------------------------------------------
export const salonKeys = {
    all: ['salons'] as const,
    lists: () => [...salonKeys.all, 'list'] as const,
    byOrganisation: (organisationId: string) => [...salonKeys.all, 'list', 'by-organisation', organisationId] as const,
    detail: (id: string) => [...salonKeys.all, 'detail', id] as const,
    creates: () => [...salonKeys.all, 'create'] as const,
    updates: () => [...salonKeys.all, 'update'] as const,
    deletes: () => [...salonKeys.all, 'delete'] as const,
};

// ----------------------------------------------------------------------
// 2. Query Options Factory
// ----------------------------------------------------------------------
export const salonQueries = {
    list: () => queryOptions({
        queryKey: salonKeys.lists(),
        queryFn: () => listSalons(),
    }),
    listByOrganisation: (organisationId: string) => queryOptions({
        queryKey: salonKeys.byOrganisation(organisationId),
        queryFn: () => getSalonsByOrganisation(organisationId),
    }),
    getOne: (id: string) => queryOptions({
        queryKey: salonKeys.detail(id),
        queryFn: () => getSalonById(id),
    }),
};
