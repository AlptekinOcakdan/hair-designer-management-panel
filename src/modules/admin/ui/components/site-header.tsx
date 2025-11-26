"use client"

import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { usePathname } from "next/navigation"
import React from "react"
import Link from "next/link"
import type { Icon } from "@tabler/icons-react"

type NavItem = {
    title: string
    url: string
    icon?: Icon
}

export function SiteHeader({ navItems }: { navItems: NavItem[] }) {
    const pathname = usePathname()
    const segments = pathname.split("/").filter(Boolean)

    const breadcrumbItems = segments.map((segment, index) => {
        const href = "/" + segments.slice(0, index + 1).join("/")
        const isLast = index === segments.length - 1

        // Find the title from navItems, fallback to capitalized segment
        const navItem = navItems.find((item) => item.url === href)
        const title =
            navItem?.title || segment.charAt(0).toUpperCase() + segment.slice(1)

        return (
            <React.Fragment key={href}>
                <BreadcrumbItem>
                    {isLast ? (
                        <BreadcrumbPage>{title}</BreadcrumbPage>
                    ) : (
                        <BreadcrumbLink asChild>
                            <Link href={href}>{title}</Link>
                        </BreadcrumbLink>
                    )}
                </BreadcrumbItem>
                {!isLast && <BreadcrumbSeparator />}
            </React.Fragment>
        )
    })

    return (
        <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
            <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
                <SidebarTrigger className="-ml-1" />
                <Separator
                    orientation="vertical"
                    className="mx-2 data-[orientation=vertical]:h-4"
                />
                <Breadcrumb>
                    <BreadcrumbList>{breadcrumbItems}</BreadcrumbList>
                </Breadcrumb>
            </div>
        </header>
    )
}
