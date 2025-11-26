"use server";

import { fetchWithAuth } from '@/lib/api';
import { createApiError, parseJsonSafe } from '@/lib/utils';

// Tipler (User.yaml'dan)
export type User = {
    id: string;
    firstname: string;
    lastname: string;
    username: string;
    email: string;
    phoneNumber: string | null;
    emailVerified: boolean;
    phoneVerified: boolean;
    refreshToken: string;
    TOSAccepted: boolean;
    createdAt: string;
    updatedAt: string | null;
};

export type ClientInfo = {
    id: string;
    firstname: string;
    lastname: string;
    email: string;
    phoneNumber: string | null;
};

export type AppointmentResponse = {
    id: string;
    clientId: string;
    staffId: string;
    procedureIds: string[];
    appointmentDate: string;
    isCompleted: boolean; // Yazım hatası düzeltildi: isComleted -> isCompleted
    isCanceled: boolean;
    cancellationReason: string | null;
    client: ClientInfo | null;
};

export type CreateUserRequest = {
    firstname: string;
    lastname: string;
    email: string;
    password?: string;
    phoneNumber?: string;
}

type UpdateUserRequest = {
    firstname?: string;
    lastname?: string;
    email?: string;
    phoneNumber?: string;
};

type StaffOptions = {
    availableForAppointments?: boolean;
    availableWeekDays?: string[];
    availableHours?: string[];
    nonAvailableRange?: string[];
};

type CreateAssignRequest = {
    userData: {
        firstname: string;
        lastname: string;
        username: string;
        email: string;
        password?: string;
        phoneNumber: string;
    };
    salonId: string;
    roleId: string;
    staffOptions?: StaffOptions;
};

type AssignRequest = {
    userId: string;
    salonId: string;
    roleId: string;
    staffOptions?: StaffOptions;
};

type AssignRoleRequest = {
    userId: string;
    roleId: string;
    organisationId?: string | null;
    salonId?: string | null;
};

type SetWorkingScheduleRequest = {
    availableWeekDays: string[];
    availableHours: string[];
};

type SetAvailabilityRequest = {
    available: boolean;
};

type NonAvailableRangeRequest = {
    start: string;
    end: string;
    reason: string;
};

type StaffPerformedProcedureRequest = {
    staffId: string;
    procedureId: string;
    durationMinutes: number;
    price: string;
};

type Procedure = {
    id: string;
    name: string;
    description: string;
    durationMinutes: number;
    price: string;
    createdAt: string;
    updatedAt: string | null;
};

type StaffProceduresResponseItem = {
    staffId: string;
    firstname: string;
    lastname: string;
    procedures: Procedure[];
};

export type StaffSalonSettings = {
    salonId: string;
    userId: string;
    avalaibleForAppointments: boolean;
    availableWeekDays: string[];
    availableHours: string[];
    nonAvailableRange: string[];
    salonName: string;
    salonLocation: string;
};

export type OrganisationUser = {
    user: {
        id: string;
        firstname: string;
        lastname: string;
        email: string;
    };
    salon: {
        id: string;
        name: string;
    } | null;
    roles: {
        id: string;
        name: string;
    }[];
};

type BookAppointmentRequest = {
    clientId?: string;
    staffId: string;
    procedureIds: string[];
    appointmentDate: string;
};

type RequestCancelRequest = {
    userId: string;
    reason: string;
};

type CompleteAppointmentRequest = {
    staffId: string;
};

type CancelAppointmentRequest = {
    reason: string;
}

export type StaffProcedureDetail = {
    userId: string;
    procedureId: string;
    procedureName: string;
    procedureDescription: string;
    duration: number;
    price: string;
    createdAt: string;
    updatedAt: string | null;
};

type UpdateStaffProcedureRequest = {
    durationMinutes: number;
    price: string;
};

export async function createUser(payload: CreateUserRequest): Promise<User> {
    const res = await fetchWithAuth('/users', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
    const data = await parseJsonSafe(res);
    if (res.status === 201) return data as User;
    throw createApiError(res.status, data);
}

/**
 * Create a new user and assign to a salon as staff
 */
export async function createAndAssignUser(payload: CreateAssignRequest): Promise<User> {
    const res = await fetchWithAuth('/users/create-assign', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
    const data = await parseJsonSafe(res);
    if (res.status === 201) return data as User;
    throw createApiError(res.status, data);
}

/**
 * Get authenticated staff's own procedures
 */
export async function getMyProcedures(): Promise<StaffProcedureDetail[]> {
    const res = await fetchWithAuth('/users/staff/my-procedures', {
        method: 'GET',
    });
    const data = await parseJsonSafe(res);
    if (res.ok) return data as StaffProcedureDetail[];
    throw createApiError(res.status, data);
}

/**
 * Get authenticated staff's salons and settings
 */
export async function getMySalons(): Promise<StaffSalonSettings[]> {
    const res = await fetchWithAuth('/users/staff/salons', {
        method: 'GET',
    });
    const data = await parseJsonSafe(res);
    if (res.ok) return data as StaffSalonSettings[];
    throw createApiError(res.status, data);
}

/**
 * Update a staff procedure (duration/price)
 */
export async function updateMyProcedure(procedureId: string, payload: UpdateStaffProcedureRequest): Promise<void> {
    const res = await fetchWithAuth(`/users/staff/procedure/${encodeURIComponent(procedureId)}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
    });
    if (res.status === 204) return;
    const data = await parseJsonSafe(res);
    throw createApiError(res.status, data);
}

/**
 * Delete a staff procedure
 */
export async function deleteMyProcedure(procedureId: string): Promise<void> {
    const res = await fetchWithAuth(`/users/staff/procedure/${encodeURIComponent(procedureId)}`, {
        method: 'DELETE',
    });
    if (res.status === 204) return;
    const data = await parseJsonSafe(res);
    throw createApiError(res.status, data);
}

/**
 * Get all global procedures
 */
export async function getAllGlobalProcedures(): Promise<Procedure[]> {
    const res = await fetchWithAuth('/users/procedures', {
        method: 'GET',
    });
    const data = await parseJsonSafe(res);
    if (res.ok) return data as Procedure[];
    throw createApiError(res.status, data);
}

/**
 * Assign an existing user to a salon as staff
 */
export async function assignUserToSalon(payload: AssignRequest): Promise<void> {
    const res = await fetchWithAuth('/users/assign', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
    if (res.status === 204) return;
    const data = await parseJsonSafe(res);
    throw createApiError(res.status, data);
}

/**
 * Assign a role to a user
 */
export async function assignRoleToUser(payload: AssignRoleRequest): Promise<void> {
    const res = await fetchWithAuth('/users/assign-role', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
    if (res.status === 204) return;
    const data = await parseJsonSafe(res);
    throw createApiError(res.status, data);
}

/**
 * Set authenticated staff user's working schedule for a salon
 */
export async function setStaffWorkingSchedule(salonId: string, payload: SetWorkingScheduleRequest): Promise<void> {
    const res = await fetchWithAuth(`/users/${encodeURIComponent(salonId)}/schedule`, {
        method: 'POST',
        body: JSON.stringify(payload),
    });
    if (res.status === 204) return;
    const data = await parseJsonSafe(res);
    throw createApiError(res.status, data);
}

/**
 * Set authenticated staff user's availability for appointments in a salon
 */
export async function setStaffAvailability(salonId: string, payload: SetAvailabilityRequest): Promise<void> {
    const res = await fetchWithAuth(`/users/${encodeURIComponent(salonId)}/availability`, {
        method: 'POST',
        body: JSON.stringify(payload),
    });
    if (res.status === 204) return;
    const data = await parseJsonSafe(res);
    throw createApiError(res.status, data);
}

/**
 * Add a non-available range for authenticated staff user
 */
export async function setStaffNonAvailableRange(salonId: string, payload: NonAvailableRangeRequest): Promise<void> {
    const res = await fetchWithAuth(`/users/${encodeURIComponent(salonId)}/non-available`, {
        method: 'POST',
        body: JSON.stringify(payload),
    });
    if (res.status === 204) return;
    const data = await parseJsonSafe(res);
    throw createApiError(res.status, data);
}

/**
 * Add a performed procedure record for a staff
 */
export async function recordStaffProcedure(payload: StaffPerformedProcedureRequest): Promise<void> {
    const res = await fetchWithAuth('/users/staff/procedure', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
    if (res.status === 201) return;
    const data = await parseJsonSafe(res);
    throw createApiError(res.status, data);
}

/**
 * Get staff members in a salon and their performed procedures
 */
export async function getSalonStaffProcedures(salonId: string): Promise<StaffProceduresResponseItem[]> {
    const res = await fetchWithAuth(`/users/salon/${encodeURIComponent(salonId)}/staff-procedures`, {
        method: 'GET',
    });
    const data = await parseJsonSafe(res);
    if (res.ok) return data as StaffProceduresResponseItem[];
    throw createApiError(res.status, data);
}

/**
 * Get authenticated staff's appointments (optional date filter YYYY-MM-DD)
 */
export async function getStaffAppointments(date?: string): Promise<AppointmentResponse[]> {
    // Query string oluştur
    const searchParams = new URLSearchParams();
    if (date) {
        searchParams.append('date', date);
    }

    // URL'e query string ekle
    const endpoint = `/users/staff/appointments${date ? `?${searchParams.toString()}` : ''}`;

    const res = await fetchWithAuth(endpoint, {
        method: 'GET',
    });

    const data = await parseJsonSafe(res);
    if (res.ok) return data as AppointmentResponse[];
    throw createApiError(res.status, data);
}

/**
 * Get all users
 */
export async function getUsers(): Promise<User[]> {
    const res = await fetchWithAuth('/users', {
        method: 'GET',
    });
    const data = await parseJsonSafe(res);
    if (res.ok) return data as User[];
    throw createApiError(res.status, data);
}

/**
 * Get a user by ID
 */
export async function getUserById(id: string): Promise<User> {
    const res = await fetchWithAuth(`/users/${encodeURIComponent(id)}`, {
        method: 'GET',
    });
    const data = await parseJsonSafe(res);
    if (res.ok) return data as User;
    throw createApiError(res.status, data);
}

/**
 * Update a user by ID
 */
export async function updateUser(id: string, payload: UpdateUserRequest): Promise<User> {
    const res = await fetchWithAuth(`/users/${encodeURIComponent(id)}`, {
        method: 'POST',
        body: JSON.stringify(payload),
    });
    const data = await parseJsonSafe(res);
    if (res.ok) return data as User;
    throw createApiError(res.status, data);
}

/**
 * Delete a user by ID
 */
export async function deleteUser(id: string): Promise<void> {
    const res = await fetchWithAuth(`/users/${encodeURIComponent(id)}/delete`, {
        method: 'POST',
    });
    if (res.status === 204) return;
    const data = await parseJsonSafe(res);
    throw createApiError(res.status, data);
}

/**
 * Book an appointment with a staff
 */
export async function bookAppointment(payload: BookAppointmentRequest): Promise<void> {
    const res = await fetchWithAuth('/users/book', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
    if (res.status === 201) return;
    const data = await parseJsonSafe(res);
    throw createApiError(res.status, data);
}

/**
 * Request appointment cancellation by user
 */
export async function requestAppointmentCancellation(appointmentId: string, payload: RequestCancelRequest): Promise<void> {
    const res = await fetchWithAuth(`/users/appointment/${encodeURIComponent(appointmentId)}/request-cancel`, {
        method: 'POST',
        body: JSON.stringify(payload),
    });
    if (res.ok) return;
    const data = await parseJsonSafe(res);
    throw createApiError(res.status, data);
}

/**
 * Mark an appointment as completed (staff only)
 */
export async function completeAppointment(appointmentId: string, payload: CompleteAppointmentRequest): Promise<void> {
    const res = await fetchWithAuth(`/users/appointment/${encodeURIComponent(appointmentId)}/complete`, {
        method: 'POST',
        body: JSON.stringify(payload),
    });
    if (res.ok) return;
    const data = await parseJsonSafe(res);
    throw createApiError(res.status, data);
}

/**
 * Cancel an appointment (staff only)
 */
export async function cancelAppointment(appointmentId: string, payload: CancelAppointmentRequest): Promise<void> {
    const res = await fetchWithAuth(`/users/appointment/${encodeURIComponent(appointmentId)}/cancel`, {
        method: 'POST',
        body: JSON.stringify(payload),
    });
    if (res.ok) return;
    const data = await parseJsonSafe(res);
    throw createApiError(res.status, data);
}

/**
 * Get all users in an organisation
 */
export async function getUsersByOrganisation(organisationId: string): Promise<OrganisationUser[]> {
    const res = await fetchWithAuth(`/users/organisation/${encodeURIComponent(organisationId)}`, {
        method: 'GET',
    });

    const data = await parseJsonSafe(res);
    if (res.ok) return data as OrganisationUser[];
    throw createApiError(res.status, data);
}