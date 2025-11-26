import {dehydrate, HydrationBoundary, QueryClient} from "@tanstack/react-query";
import {organisationQueries} from "@/modules/organisations/server/queries";
import {userQueries} from "@/modules/users/server/queries";
import {EmployeesView} from "@/modules/manager/ui/views/employees-view";
import {salonQueries} from "@/modules/salons/server/queries";
import {roleQueries} from "@/modules/roles/server/queries";
export const dynamic = "force-dynamic";

const Page = async () => {
    const queryClient = new QueryClient();

    const organisations = await queryClient.fetchQuery(organisationQueries.listMine());
    if (organisations && organisations.length > 0) {
        const orgId = organisations[0].id;
        await queryClient.prefetchQuery(userQueries.listByOrganisation(orgId));
        await queryClient.prefetchQuery(salonQueries.listByOrganisation(orgId));
        await queryClient.prefetchQuery(roleQueries.list());
    }

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <EmployeesView />
        </HydrationBoundary>
    );
};

export default Page;