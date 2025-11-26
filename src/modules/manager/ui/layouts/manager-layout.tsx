"use client";

import {LayoutProps} from "@/lib/utils";
import {SidebarInset, SidebarProvider} from "@/components/ui/sidebar";
import {CSSProperties} from "react";
import {SiteHeader} from "@/modules/admin/ui/components/site-header";
import {
    IconBuildingStore,
    IconLayoutDashboard,
    IconUsers
} from "@tabler/icons-react";
import {ManagerSidebar} from "@/modules/manager/ui/components/manager-sidebar";

const navItems = [
    {
        title: "Genel Bakış",
        url: "/manager/dashboard",
        icon: IconLayoutDashboard,
    },
    {
        title: "Salonlar",
        url: "/manager/salons",
        icon: IconBuildingStore,
    },
    {
        title: "Çalışanlar",
        url: "/manager/employees",
        icon: IconUsers,
    },
]

export const ManagerLayout = ({children}: LayoutProps) => {
    return (
        <SidebarProvider
            style={
                {
                    "--sidebar-width": "calc(var(--spacing) * 72)",
                    "--header-height": "calc(var(--spacing) * 12)",
                } as CSSProperties
            }
        >
            <ManagerSidebar variant="inset" navItems={navItems}/>
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
