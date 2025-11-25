import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import {ReactNode} from "react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface LayoutProps {
    children: ReactNode
}