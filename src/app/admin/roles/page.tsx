import {dehydrate, HydrationBoundary, QueryClient} from "@tanstack/react-query";
import {roleQueries} from "@/modules/roles/server/queries";
import {RolesView} from "@/modules/admin/ui/views/roles-view";
export const dynamic = "force-dynamic";

const Page = async () => {
    const queryClient = new QueryClient();

    await queryClient.prefetchQuery(roleQueries.list());

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <RolesView />
        </HydrationBoundary>
    );
};

export default Page;