"use client";

import {LayoutProps} from "@/lib/utils";
import {SidebarInset, SidebarProvider} from "@/components/ui/sidebar";
import {CSSProperties} from "react";
import {AdminSidebar} from "@/modules/admin/ui/components/admin-sidebar";
import {SiteHeader} from "@/modules/admin/ui/components/site-header";
import {
    IconParkingCircleFilled,
    IconSitemapFilled,
    IconUserCheck,
    IconUserFilled
} from "@tabler/icons-react";

const navItems = [
    {
        title: "Organizasyonlar",
        url: "/admin/organisations",
        icon: IconSitemapFilled,
    },
    {
        title: "Kullanıcılar",
        url: "/admin/users",
        icon: IconUserFilled,
    },
    {
        title: "Roller",
        url: "/admin/roles",
        icon: IconUserCheck,
    },
    {
        title: "Yetkiler",
        url: "/admin/permissions",
        icon: IconParkingCircleFilled,
    },
]

export const AdminLayout = ({children}: LayoutProps) => {
    return (
        <SidebarProvider
            style={
                {
                    "--sidebar-width": "calc(var(--spacing) * 72)",
                    "--header-height": "calc(var(--spacing) * 12)",
                } as CSSProperties
            }
        >
            <AdminSidebar variant="inset" navItems={navItems}/>
            <SidebarInset>
                <SiteHeader navItems={navItems}/>
                <div className="flex flex-1 flex-col">
                    <div className="@container/main flex flex-1 flex-col gap-2">
                        {children}
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
};