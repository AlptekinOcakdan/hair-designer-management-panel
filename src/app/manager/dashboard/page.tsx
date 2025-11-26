import {dehydrate, HydrationBoundary, QueryClient} from "@tanstack/react-query";
import {DashboardView} from "@/modules/manager/ui/views/dashboard-view";
export const dynamic = "force-dynamic";

const Page = async () => {
    const queryClient = new QueryClient();

    // Gerekli ön yüklemeler burada yapılabilir.
    // Örneğin, ilk organizasyonun gelirleri.
    // const orgs = await queryClient.fetchQuery(organisationQueries.listMine());
    // if (orgs && orgs.length > 0) {
    //     await queryClient.prefetchQuery(organisationQueries.getEarnings(orgs[0].id));
    // }

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <DashboardView />
        </HydrationBoundary>
    );
};

export default Page;