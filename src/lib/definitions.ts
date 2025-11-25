// --- Form State Tipi (Generic) ---
export type FormState<T = undefined> = {
    success: boolean;
    message?: string;
    errors?: {
        [key: string]: string[];
    };
    payload?: T;
};
