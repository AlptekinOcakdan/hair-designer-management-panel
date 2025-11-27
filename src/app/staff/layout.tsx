import type {Metadata} from "next";
import {LayoutProps} from "@/lib/utils";
import {dehydrate, HydrationBoundary, QueryClient} from "@tanstack/react-query";
import {StaffLayout} from "@/modules/staff/ui/layouts/staff-layout";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Staff Panel",
    description: "Staff panel layout",
};

const Layout = async ({children}:LayoutProps) => {
    const queryClient = new QueryClient();

    // Personel ile ilgili gerekli datalar burada prefetch edilebilir
    // await queryClient.prefetchQuery(userQueries.detail(userId));

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <StaffLayout>
                {children}
            </StaffLayout>
        </HydrationBoundary>
    );
};

export default Layout;