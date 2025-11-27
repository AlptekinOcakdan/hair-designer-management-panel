"use client"

import * as React from "react"
import {
    IconInnerShadowTop,
} from "@tabler/icons-react"
import type { Icon } from "@tabler/icons-react"

import {NavMain} from "@/modules/admin/ui/components/nav-main"
import {NavUser} from "@/modules/admin/ui/components/nav-user";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"

// Mock data, gerçek uygulamada context veya prop'tan gelebilir
const data = {
    user: {
        name: "Staff User",
        email: "staff@example.com",
        avatar: "/avatars/shadcn.jpg",
    },
}

interface StaffSidebarProps extends React.ComponentProps<typeof Sidebar> {
    navItems: {
        title: string
        url: string
        icon?: Icon
    }[]
}

export function StaffSidebar({ navItems, ...props }: StaffSidebarProps) {
    // Personel paneli için organizasyon değiştirme özelliği kapalı
    const canSwitchOrganisation = false;

    return (
        <Sidebar collapsible="offcanvas" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton className="data-[slot=sidebar-menu-button]:!p-1.5 pointer-events-none">
                            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                <IconInnerShadowTop className="size-4" />
                            </div>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-semibold">Hair Design Panel</span>
                                <span className="truncate text-xs">Personel Paneli</span>
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={navItems}/>
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={data.user}/>
            </SidebarFooter>
        </Sidebar>
    )
}