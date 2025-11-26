import {dehydrate, HydrationBoundary, QueryClient} from "@tanstack/react-query";
import {UsersView} from "@/modules/admin/ui/views/users-view";
import {userQueries} from "@/modules/users/server/queries";
import {organisationQueries} from "@/modules/organisations/server/queries";
import {salonQueries} from "@/modules/salons/server/queries";
import {roleQueries} from "@/modules/roles/server/queries";
export const dynamic = "force-dynamic";

const Page = async () => {
    const queryClient = new QueryClient();

    await Promise.all([
        queryClient.prefetchQuery(userQueries.list()),
        queryClient.prefetchQuery(organisationQueries.list()),
        queryClient.prefetchQuery(salonQueries.list()),
        queryClient.prefetchQuery(roleQueries.list()),
    ]);

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <UsersView/>
        </HydrationBoundary>
    );
};

export default Page;