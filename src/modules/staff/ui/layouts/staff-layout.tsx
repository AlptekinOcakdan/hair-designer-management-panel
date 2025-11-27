"use client";

import {LayoutProps} from "@/lib/utils";
import {SidebarInset, SidebarProvider} from "@/components/ui/sidebar";
import {CSSProperties} from "react";
import {SiteHeader} from "@/modules/admin/ui/components/site-header";
import {
    IconCalendar,
    IconCut,
    IconClock
} from "@tabler/icons-react";
import {StaffSidebar} from "@/modules/staff/ui/components/staff-sidebar";

const navItems = [
    {
        title: "Randevularım",
        url: "/staff/appointments",
        icon: IconCalendar,
    },
    {
        title: "Prosedürlerim",
        url: "/staff/procedures",
        icon: IconCut,
    },
    {
        title: "Çalışma Durumum",
        url: "/staff/availability",
        icon: IconClock,
    },
]

export const StaffLayout = ({children}: LayoutProps) => {
    return (
        <SidebarProvider
            style={
                {
                    "--sidebar-width": "calc(var(--spacing) * 72)",
                    "--header-height": "calc(var(--spacing) * 12)",
                } as CSSProperties
            }
        >
            <StaffSidebar variant="inset" navItems={navItems}/>
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