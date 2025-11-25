"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
    // QueryClient'ı state içinde tutarak, component re-render olduğunda
    // client'ın yeniden oluşturulmasını engelliyoruz.
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        // Verilerin bayatlama süresi (opsiyonel ayar)
                        // 1 dakika boyunca cache'den oku, sonra tekrar fetch et
                        staleTime: 60 * 1000,
                    },
                },
            })
    );

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    );
}