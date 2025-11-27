import {dehydrate, HydrationBoundary, QueryClient} from "@tanstack/react-query";
import {userQueries} from "@/modules/users/server/queries";
import {AppointmentsView} from "@/modules/staff/ui/views/appointments-view";
export const dynamic = "force-dynamic";

const Page = async () => {
    const queryClient = new QueryClient();

    // Personelin randevularını önceden yükle
    await queryClient.prefetchQuery(userQueries.listStaffAppointments());

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <AppointmentsView />
        </HydrationBoundary>
    );
};

export default Page;