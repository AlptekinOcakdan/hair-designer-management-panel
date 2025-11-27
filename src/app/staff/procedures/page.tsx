import {dehydrate, HydrationBoundary, QueryClient} from "@tanstack/react-query";
import {userQueries} from "@/modules/users/server/queries";
import {ProceduresView} from "@/modules/staff/ui/views/procedures-view";
import {procedureQueries} from "@/modules/procedures/server/queries";
export const dynamic = "force-dynamic";

const Page = async () => {
    const queryClient = new QueryClient();

    // Personelin prosedürlerini ve global listeyi önceden yükle
    await Promise.all([
        queryClient.prefetchQuery(userQueries.listMyProcedures()),
        queryClient.prefetchQuery(procedureQueries.list())
    ]);

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <ProceduresView />
        </HydrationBoundary>
    );
};

export default Page;