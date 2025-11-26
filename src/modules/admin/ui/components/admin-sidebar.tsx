"use client"

import * as React from "react"
import {
    IconInnerShadowTop,
} from "@tabler/icons-react"
import type { Icon } from "@tabler/icons-react"

import {NavMain} from "./nav-main"
import {NavUser} from "./nav-user";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
    user: {
        name: "shadcn",
        email: "m@example.com",
        avatar: "/avatars/shadcn.jpg",
    },
}

interface AdminSidebarProps extends React.ComponentProps<typeof Sidebar> {
    navItems: {
        title: string
        url: string
        icon?: Icon
    }[]
}

export function AdminSidebar({ navItems, ...props }: AdminSidebarProps) {
    return (
        <Sidebar collapsible="offcanvas" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton className="data-[slot=sidebar-menu-button]:!p-1.5">
                            <IconInnerShadowTop className="!size-5"/>
                            <span className="text-base font-semibold">Hair Design Panel</span>
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
