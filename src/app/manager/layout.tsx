import type {Metadata} from "next";
import {LayoutProps} from "@/lib/utils";
import {ManagerLayout} from "@/modules/manager/ui/layouts/manager-layout";
import {dehydrate, HydrationBoundary, QueryClient} from "@tanstack/react-query";
import {organisationQueries} from "@/modules/organisations/server/queries";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Manager Panel",
    description: "Manager panel layout",
};

const Layout = async ({children}:LayoutProps) => {
    const queryClient = new QueryClient();

    await queryClient.prefetchQuery(organisationQueries.listMine());

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <ManagerLayout>
                {children}
            </ManagerLayout>
        </HydrationBoundary>
    );
};

export default Layout;
