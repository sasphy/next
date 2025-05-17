"use client"

import * as React from "react"
import { type Icon } from "@tabler/icons-react"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavSecondary({
  items,
  ...props
}: {
  items: {
    title: string
    url: string
    icon: Icon
  }[]
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <a href={item.url} className="sidebar-link hover:sidebar-link-hover inline-flex w-full items-center justify-start whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium text-foreground [a&]:no-underline [&[data-slot=sidebar-menu-button]]:rounded-md [&[data-slot=sidebar-menu-button]]:p-2">
                <item.icon />
                <span>{item.title}</span>
              </a>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
