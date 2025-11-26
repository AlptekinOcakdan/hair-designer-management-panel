import {dehydrate, HydrationBoundary, QueryClient} from "@tanstack/react-query";
import {permissionQueries} from "@/modules/permissions/server/queries";
import {PermissionsView} from "@/modules/admin/ui/views/permissions-view";
export const dynamic = "force-dynamic";

const Page = async () => {
    const queryClient = new QueryClient();

    await queryClient.prefetchQuery(permissionQueries.list());

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <PermissionsView />
        </HydrationBoundary>
    );
};

export default Page;