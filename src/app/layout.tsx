import type {Metadata} from "next";
import {Inter} from "next/font/google";
import "./globals.css";
import {ReactNode} from "react";
import {Providers} from "@/components/providers";
import {Toaster} from "@/components/ui/sonner";

const inter = Inter({
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Hair Design Panel",
    description: "Hair Design Application",
};

export default function RootLayout({children}: Readonly<{ children: ReactNode }>) {
    return (
        <html lang="en">
        <body className={inter.className}>
        <Providers>
            {children}
            <Toaster/>
        </Providers>
        </body>
        </html>
    );
}
