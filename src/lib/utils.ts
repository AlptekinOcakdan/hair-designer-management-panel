import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import {ReactNode} from "react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface LayoutProps {
    children: ReactNode
}

// 1. Define a custom Error type that includes your API specific fields
export interface ApiError extends Error {
    status: number;
    body: unknown;
}

export async function parseJsonSafe(res: Response): Promise<unknown> {
    const text = await res.text();
    try {
        return text ? JSON.parse(text) : null;
    } catch {
        return text;
    }
}

export function createApiError(status: number, body: unknown): ApiError {
    // 2. Safely extract the message without using 'any'
    // We assume body might be an object with a message string
    const message = (body as { message?: string })?.message || `API error (${status})`;

    // 3. Create the error and cast it to your custom interface
    const err = new Error(message) as ApiError;
    err.status = status;
    err.body = body;

    return err;
}