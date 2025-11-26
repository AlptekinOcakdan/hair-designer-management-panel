import {dehydrate, HydrationBoundary, QueryClient} from "@tanstack/react-query";
import {organisationQueries} from "@/modules/organisations/server/queries";
import {salonQueries} from "@/modules/salons/server/queries";
import {SalonsView} from "@/modules/manager/ui/views/salons-view";
export const dynamic = "force-dynamic";

const Page = async () => {
    const queryClient = new QueryClient();

    // Yöneticinin ilk organizasyonunu ve o organizasyonun salonlarını önceden yükle
    const organisations = await queryClient.fetchQuery(organisationQueries.listMine());
    if (organisations && organisations.length > 0) {
        await queryClient.prefetchQuery(salonQueries.listByOrganisation(organisations[0].id));
    }

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <SalonsView />
        </HydrationBoundary>
    );
};

export default Page;