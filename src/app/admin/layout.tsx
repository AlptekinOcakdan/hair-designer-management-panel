import type {Metadata} from "next";
import {LayoutProps} from "@/lib/utils";
import {AdminLayout} from "@/modules/admin/ui/layouts/admin-layout";

export const metadata: Metadata = {
    title: "Admin Panel",
    description: "Admin panel layout",
};

const Layout = ({children}:LayoutProps) => {
    return (
        <AdminLayout>
            {children}
        </AdminLayout>
    );
};

export default Layout;