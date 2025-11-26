"use server";

import { fetchWithAuth } from '@/lib/api';
import { createApiError, parseJsonSafe } from '@/lib/utils';

// Tipler (Procedure.yaml'dan)
type Procedure = {
    id: string;
    name: string;
    description: string | null;
    durationMinutes: number | null;
    price: string | null;
    createdAt: string;
    updatedAt: string | null;
};

type CreateProcedureRequest = {
    name: string;
    description?: string;
    durationMinutes?: number;
    price?: string;
};

type UpdateProcedureRequest = {
    name?: string;
    description?: string;
    durationMinutes?: number;
    price?: string;
    createdAt?: string;
};

/**
 * Create a new procedure
 */
export async function createProcedure(payload: CreateProcedureRequest): Promise<Procedure> {
    const res = await fetchWithAuth('/procedures', {
        method: 'POST',
        body: JSON.stringify(payload),
    });

    const data = await parseJsonSafe(res);
    if (res.status === 201) return data as Procedure;
    throw createApiError(res.status, data);
}

/**
 * Get all procedures
 */
export async function listProcedures(): Promise<Procedure[]> {
    const res = await fetchWithAuth('/procedures', {
        method: 'GET',
    });

    const data = await parseJsonSafe(res);
    if (res.ok) return data as Procedure[];
    throw createApiError(res.status, data);
}

/**
 * Get procedure by id
 */
export async function getProcedureById(id: string): Promise<Procedure> {
    const res = await fetchWithAuth(`/procedures/${encodeURIComponent(id)}`, {
        method: 'GET',
    });

    const data = await parseJsonSafe(res);
    if (res.ok) return data as Procedure;
    throw createApiError(res.status, data);
}

/**
 * Update a procedure
 */
export async function updateProcedure(id: string, payload: UpdateProcedureRequest): Promise<Procedure> {
    const res = await fetchWithAuth(`/procedures/${encodeURIComponent(id)}`, {
        method: 'POST',
        body: JSON.stringify(payload),
    });

    const data = await parseJsonSafe(res);
    if (res.ok) return data as Procedure;
    throw createApiError(res.status, data);
}

/**
 * Delete a procedure
 */
export async function deleteProcedure(id: string): Promise<void> {
    const res = await fetchWithAuth(`/procedures/${encodeURIComponent(id)}/delete`, {
        method: 'POST',
    });

    if (res.status === 204) return;
    const data = await parseJsonSafe(res);
    throw createApiError(res.status, data);
}

