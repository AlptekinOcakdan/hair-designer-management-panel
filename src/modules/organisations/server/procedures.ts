import { fetchWithAuth } from '@/lib/api';

// Tipler (minimal)
type Organisation = {
    id: string;
    userId: string;
    name: string;
    createdAt: string;
    updatedAt?: string | null;
};

type CreateOrganisationRequest = {
    name: string;
};

type UpdateOrganisationRequest = {
    name?: string;
    createdAt?: string;
};

type EarningsItem = {
    salonId: string;
    salonName: string;
    total: string;
};

/**
 * Create a new organisation
 */
export async function createOrganisation(payload: CreateOrganisationRequest): Promise<Organisation> {
    const res = await fetchWithAuth('/organisations', {
        method: 'POST',
        body: JSON.stringify(payload),
    });

    const data = await parseJsonSafe(res);
    if (res.status === 201 || res.ok) return data as Organisation;
    throw createApiError(res.status, data);
}

/**
 * Get all organisations (public)
 */
export async function listOrganisations(): Promise<Organisation[]> {
    const res = await fetchWithAuth('/organisations', {
        method: 'GET',
    });

    const data = await parseJsonSafe(res);
    if (res.ok) return data as Organisation[];
    throw createApiError(res.status, data);
}

/**
 * Get organisations of authenticated user
 */
export async function getMyOrganisations(): Promise<Organisation[]> {
    const res = await fetchWithAuth('/organisations/me', {
        method: 'GET',
    });

    const data = await parseJsonSafe(res);
    if (res.ok) return data as Organisation[];
    throw createApiError(res.status, data);
}

/**
 * Get organisation by id (public)
 */
export async function getOrganisationById(id: string): Promise<Organisation> {
    const res = await fetchWithAuth(`/organisations/${encodeURIComponent(id)}`, {
        method: 'GET',
    });

    const data = await parseJsonSafe(res);
    if (res.ok) return data as Organisation;
    throw createApiError(res.status, data);
}

/**
 * Update an organisation (uses POST /:id)
 */
export async function updateOrganisation(id: string, payload: UpdateOrganisationRequest): Promise<Organisation> {
    const res = await fetchWithAuth(`/organisations/${encodeURIComponent(id)}`, {
        method: 'POST',
        body: JSON.stringify(payload),
    });

    const data = await parseJsonSafe(res);
    if (res.ok) return data as Organisation;
    throw createApiError(res.status, data);
}

/**
 * Delete an organisation (uses POST /:id/delete) - returns void on success
 */
export async function deleteOrganisation(id: string): Promise<void> {
    const res = await fetchWithAuth(`/organisations/${encodeURIComponent(id)}/delete`, {
        method: 'POST',
    });

    if (res.status === 204) return;
    const data = await parseJsonSafe(res);
    throw createApiError(res.status, data);
}

/**
 * Get earnings report for an organisation
 * salonIds: string[] | string (comma separated) | undefined
 * month: 'YYYY-MM' | undefined
 * year: 'YYYY' | undefined
 */
export async function getOrganisationEarnings(
    id: string,
    opts?: { month?: string; year?: string; salonIds?: string[] | string }
): Promise<EarningsItem[]> {
    const params = new URLSearchParams();

    if (opts?.month) params.set('month', opts.month);
    if (opts?.year) params.set('year', opts.year);
    if (opts?.salonIds) {
        if (Array.isArray(opts.salonIds)) {
            // OpenAPI belirtimine göre explode: false -> comma separated
            params.set('salonIds', opts.salonIds.join(','));
        } else {
            params.set('salonIds', opts.salonIds);
        }
    }

    const query = params.toString();
    const path = `/organisations/${encodeURIComponent(id)}/earnings${query ? `?${query}` : ''}`;

    const res = await fetchWithAuth(path, { method: 'GET' });
    const data = await parseJsonSafe(res);
    if (res.ok) return data as EarningsItem[];
    throw createApiError(res.status, data);
}

/* ----------------- Helpers ----------------- */

// 1. Define a custom Error type that includes your API specific fields
export interface ApiError extends Error {
    status: number;
    body: unknown;
}

async function parseJsonSafe(res: Response): Promise<unknown> {
    const text = await res.text();
    try {
        return text ? JSON.parse(text) : null;
    } catch {
        return text;
    }
}

function createApiError(status: number, body: unknown): ApiError {
    // 2. Safely extract the message without using 'any'
    // We assume body might be an object with a message string
    const message = (body as { message?: string })?.message || `API error (${status})`;

    // 3. Create the error and cast it to your custom interface
    const err = new Error(message) as ApiError;
    err.status = status;
    err.body = body;

    return err;
}