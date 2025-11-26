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
import {OrganisationSwitcher} from "@/modules/manager/ui/components/organisation-switcher";
import {Suspense} from "react";
import {Skeleton} from "@/components/ui/skeleton";

const data = {
    user: {
        name: "shadcn",
        email: "m@example.com",
        avatar: "/avatars/shadcn.jpg",
    },
}

interface ManagerSidebarProps extends React.ComponentProps<typeof Sidebar> {
    navItems: {
        title: string
        url: string
        icon?: Icon
    }[]
}

export function ManagerSidebar({ navItems, ...props }: ManagerSidebarProps) {
    const canSwitchOrganisation = true; // İleride rol kontrolü için kullanılacak.

    return (
        <Sidebar collapsible="offcanvas" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        {canSwitchOrganisation ? (
                            <Suspense fallback={<Skeleton className="h-9 w-full" />}>
                                <OrganisationSwitcher />
                            </Suspense>
                        ) : (
                            <SidebarMenuButton className="data-[slot=sidebar-menu-button]:!p-1.5">
                                <IconInnerShadowTop className="!size-5"/>
                                <span className="text-base font-semibold">Hair Design Panel</span>
                            </SidebarMenuButton>
                        )}
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
