import {dehydrate, HydrationBoundary, QueryClient} from "@tanstack/react-query";
import {organisationQueries} from "@/modules/organisations/server/queries";
import {OrganisationsView} from "@/modules/admin/ui/views/organisations-view";
import {userQueries} from "@/modules/users/server/queries";

const Page = async () => {
    const queryClient = new QueryClient();

    await queryClient.prefetchQuery(organisationQueries.list());
    await queryClient.prefetchQuery(userQueries.list());

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <OrganisationsView />
        </HydrationBoundary>
    );
};

export default Page;