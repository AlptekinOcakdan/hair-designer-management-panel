"use server";

import { fetchWithAuth } from '@/lib/api';
import { createApiError, parseJsonSafe } from '@/lib/utils';

// Tipler (Role.yaml'dan)
export type Role = {
    id: string;
    role: string;
    createdAt: string;
    updatedAt: string | null;
};

type CreateRoleRequest = {
    role: string;
};

type UpdateRoleRequest = {
    role?: string;
    createdAt?: string;
};

/**
 * Create a new role
 */
export async function createRole(payload: CreateRoleRequest): Promise<Role> {
    const res = await fetchWithAuth('/roles', {
        method: 'POST',
        body: JSON.stringify(payload),
    });

    const data = await parseJsonSafe(res);
    if (res.status === 201) return data as Role;
    throw createApiError(res.status, data);
}

/**
 * Get all roles
 */
export async function listRoles(): Promise<Role[]> {
    const res = await fetchWithAuth('/roles', {
        method: 'GET',
    });

    const data = await parseJsonSafe(res);
    if (res.ok) return data as Role[];
    throw createApiError(res.status, data);
}

/**
 * Get role by id
 */
export async function getRoleById(id: string): Promise<Role> {
    const res = await fetchWithAuth(`/roles/${encodeURIComponent(id)}`, {
        method: 'GET',
    });

    const data = await parseJsonSafe(res);
    if (res.ok) return data as Role;
    throw createApiError(res.status, data);
}

/**
 * Update a role
 */
export async function updateRole(id: string, payload: UpdateRoleRequest): Promise<Role> {
    const res = await fetchWithAuth(`/roles/${encodeURIComponent(id)}`, {
        method: 'POST',
        body: JSON.stringify(payload),
    });

    const data = await parseJsonSafe(res);
    if (res.ok) return data as Role;
    throw createApiError(res.status, data);
}

/**
 * Delete a role
 */
export async function deleteRole(id: string): Promise<void> {
    const res = await fetchWithAuth(`/roles/${encodeURIComponent(id)}/delete`, {
        method: 'POST',
    });

    if (res.status === 204) return;
    const data = await parseJsonSafe(res);
    throw createApiError(res.status, data);
}

