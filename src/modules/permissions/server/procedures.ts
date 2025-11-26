"use server";

import { fetchWithAuth } from '@/lib/api';
import {createApiError, parseJsonSafe} from "@/lib/utils";

// Tipler (Permission.yaml'dan)
export type Permission = {
    id: string;
    action: string;
    description: string | null;
    createdAt: string;
    updatedAt: string | null;
};

type CreatePermissionRequest = {
    action: string;
    description: string;
};

type UpdatePermissionRequest = {
    id: string;
    action?: string;
    description?: string;
};

/**
 * Create a new permission
 */
export async function createPermission(payload: CreatePermissionRequest): Promise<Permission> {
    const res = await fetchWithAuth('/permissions', {
        method: 'POST',
        body: JSON.stringify(payload),
    });

    const data = await parseJsonSafe(res);
    if (res.status === 201) return data as Permission;
    throw createApiError(res.status, data);
}

/**
 * Get all permissions
 */
export async function listPermissions(): Promise<Permission[]> {
    const res = await fetchWithAuth('/permissions', {
        method: 'GET',
    });

    const data = await parseJsonSafe(res);
    if (res.ok) return data as Permission[];
    throw createApiError(res.status, data);
}

/**
 * Get permission by id
 */
export async function getPermissionById(id: string): Promise<Permission> {
    const res = await fetchWithAuth(`/permissions/${encodeURIComponent(id)}`, {
        method: 'GET',
    });

    const data = await parseJsonSafe(res);
    if (res.ok) return data as Permission;
    throw createApiError(res.status, data);
}

/**
 * Update a permission
 */
export async function updatePermission(id: string, payload: Omit<UpdatePermissionRequest, 'id'>): Promise<Permission> {
    const res = await fetchWithAuth(`/permissions/${encodeURIComponent(id)}`, {
        method: 'POST',
        body: JSON.stringify({ id, ...payload }),
    });

    const data = await parseJsonSafe(res);
    if (res.ok) return data as Permission;
    throw createApiError(res.status, data);
}

/**
 * Delete a permission
 */
export async function deletePermission(id: string): Promise<void> {
    const res = await fetchWithAuth(`/permissions/${encodeURIComponent(id)}/delete`, {
        method: 'POST',
    });

    if (res.status === 204) return;
    const data = await parseJsonSafe(res);
    throw createApiError(res.status, data);
}
