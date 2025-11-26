"use server";

import { fetchWithAuth } from '@/lib/api';
import { createApiError, parseJsonSafe } from '@/lib/utils';

// Tipler (Salon.yaml'dan)
export type Salon = {
    id: string;
    name: string;
    location: string;
    organisationId: string;
    createdAt: string;
    updatedAt: string | null;
};

type CreateSalonRequest = {
    organisationId: string;
    name: string;
    location: string;
};

type UpdateSalonRequest = {
    name?: string;
    location?: string;
};

/**
 * Create a new salon
 */
export async function createSalon(payload: CreateSalonRequest): Promise<Salon> {
    const res = await fetchWithAuth('/salons', {
        method: 'POST',
        body: JSON.stringify(payload),
    });

    const data = await parseJsonSafe(res);
    if (res.status === 201) return data as Salon;
    throw createApiError(res.status, data);
}

/**
 * Get all salons
 */
export async function listSalons(): Promise<Salon[]> {
    const res = await fetchWithAuth('/salons', {
        method: 'GET',
    });

    const data = await parseJsonSafe(res);
    if (res.ok) return data as Salon[];
    throw createApiError(res.status, data);
}

/**
 * Get salons by organisation id
 */
export async function getSalonsByOrganisation(organisationId: string): Promise<Salon[]> {
    const res = await fetchWithAuth(`/salons/organisation/${encodeURIComponent(organisationId)}`, {
        method: 'GET',
    });

    const data = await parseJsonSafe(res);
    if (res.ok) return data as Salon[];
    throw createApiError(res.status, data);
}

/**
 * Get salon by id
 */
export async function getSalonById(id: string): Promise<Salon> {
    const res = await fetchWithAuth(`/salons/${encodeURIComponent(id)}`, {
        method: 'GET',
    });

    const data = await parseJsonSafe(res);
    if (res.ok) return data as Salon;
    throw createApiError(res.status, data);
}

/**
 * Update a salon
 */
export async function updateSalon(id: string, payload: UpdateSalonRequest): Promise<Salon> {
    const res = await fetchWithAuth(`/salons/${encodeURIComponent(id)}`, {
        method: 'POST',
        body: JSON.stringify(payload),
    });

    const data = await parseJsonSafe(res);
    if (res.ok) return data as Salon;
    throw createApiError(res.status, data);
}

/**
 * Delete a salon
 */
export async function deleteSalon(id: string): Promise<void> {
    const res = await fetchWithAuth(`/salons/${encodeURIComponent(id)}/delete`, {
        method: 'POST',
    });

    if (res.status === 204) return;
    const data = await parseJsonSafe(res);
    throw createApiError(res.status, data);
}
