import {dehydrate, HydrationBoundary, QueryClient} from "@tanstack/react-query";
import {userQueries} from "@/modules/users/server/queries";
import {AvailabilityView} from "@/modules/staff/ui/views/availability-view";
export const dynamic = "force-dynamic";

const Page = async () => {
    const queryClient = new QueryClient();

    // Sayfa yüklenmeden önce personelin salon bilgilerini çek
    await queryClient.prefetchQuery(userQueries.listMySalons());

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <AvailabilityView />
        </HydrationBoundary>
    );
};

export default Page;