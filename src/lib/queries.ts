import {organisationKeys, organisationQueries} from "@/modules/organisations/server/queries";
import {permissionKeys, permissionQueries} from "@/modules/permissions/server/queries";
import {procedureKeys, procedureQueries} from "@/modules/procedures/server/queries";
import {roleKeys, roleQueries} from "@/modules/roles/server/queries";
import {salonKeys, salonQueries} from "@/modules/salons/server/queries";
import {userKeys, userQueries} from "@/modules/users/server/queries";

export const api = {
    organisations: organisationQueries,
    permissions: permissionQueries,
    procedures: procedureQueries,
    roles: roleQueries,
    salons: salonQueries,
    users: userQueries,
};

// 2. Key'ler için Global Obje (Cache Temizleme / Invalidation)
export const queryKeys = {
    organisations: organisationKeys,
    permissions: permissionKeys,
    procedures: procedureKeys,
    roles: roleKeys,
    salons: salonKeys,
    users: userKeys,
};