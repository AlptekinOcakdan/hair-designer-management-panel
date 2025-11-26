import { queryOptions } from '@tanstack/react-query';
import {
    getMyOrganisations, getOrganisationById,
    getOrganisationEarnings,
    listOrganisations
} from "@/modules/organisations/server/procedures";

type EarningsParams = Parameters<typeof getOrganisationEarnings>[1];

// ----------------------------------------------------------------------
// 1. Query Key Factory
// Cache yönetimini (Invalidation) kolaylaştırmak için anahtarlar burada
// ----------------------------------------------------------------------
export const organisationKeys = {
    all: ['organisations'] as const,

    // Genel Listeler
    lists: () => [...organisationKeys.all, 'list'] as const,

    // Kullanıcının kendi organizasyonları (Farklı bir cache olmalı)
    myLists: () => [...organisationKeys.all, 'list', 'me'] as const,

    // Tekil Detay
    detail: (id: string) => [...organisationKeys.all, 'detail', id] as const,

    // Kazanç Raporları (ID ve Filtreler cache anahtarında olmalı)
    earnings: (id: string, filters?: EarningsParams) =>
        [...organisationKeys.all, 'earnings', id, filters] as const,
};

// ----------------------------------------------------------------------
// 2. Query Options Factory
// useSuspenseQuery veya prefetchQuery içine verilecek ayarlar
// ----------------------------------------------------------------------
export const organisationQueries = {
    // Tüm organizasyonları getir (Public)
    list: () => queryOptions({
        queryKey: organisationKeys.lists(),
        queryFn: () => listOrganisations(),
    }),

    // Benim organizasyonlarımı getir (Auth)
    listMine: () => queryOptions({
        queryKey: organisationKeys.myLists(),
        queryFn: () => getMyOrganisations(),
    }),

    // ID'ye göre tekil getir
    getOne: (id: string) => queryOptions({
        queryKey: organisationKeys.detail(id),
        queryFn: () => getOrganisationById(id),
    }),

    // Kazanç raporu getir
    getEarnings: (id: string, filters?: EarningsParams) => queryOptions({
        queryKey: organisationKeys.earnings(id, filters),
        queryFn: () => getOrganisationEarnings(id, filters),
    }),
};