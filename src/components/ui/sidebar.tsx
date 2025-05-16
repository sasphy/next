"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const Sidebar = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement> & {
    className?: string
    collapsible?: boolean | "offcanvas"
    defaultCollapsed?: boolean
    position?: "left" | "right" | "top" | "bottom"
    toggled?: boolean
    onToggle?: (toggled: boolean) => void
  }
>(
  (
    {
      className,
      collapsible = false,
      defaultCollapsed = false,
      position = "left",
      toggled,
      onToggle,
      ...props
    },
    ref
  ) => {
    const [collapsed, setCollapsed] = React.useState(defaultCollapsed)

    function handleToggle() {
      setCollapsed(!collapsed)
      onToggle?.(!collapsed)
    }

    const isOffset = position === "left" || position === "right"
    const isOffsetLeft = position === "left"
    const isOffsetRight = position === "right"
    const isOffsetTop = position === "top"
    const isOffsetBottom = position === "bottom"

    return (
      <aside
        ref={ref}
        data-collapsible={collapsible ? true : undefined}
        data-collapsed={toggled !== undefined ? toggled : collapsed}
        data-orientation={isOffset ? "vertical" : "horizontal"}
        className={cn(
          "relative flex h-full w-full max-w-[300px] flex-col border-r bg-card text-card-foreground",
          {
            "flex-row border-r border-border": isOffsetLeft,
            "items-end border-l border-border": isOffsetRight,
            "border-t border-border": isOffsetBottom,
            "border-b border-border": isOffsetTop,
          },
          className
        )}
        {...props}
      />
    )
  }
)
Sidebar.displayName = "Sidebar"

const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex p-4", className)}
    {...props}
  />
))
SidebarHeader.displayName = "SidebarHeader"

const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex-1 overflow-auto", className)}
    {...props}
  />
))
SidebarContent.displayName = "SidebarContent"

const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center border-t p-4", className)}
    {...props}
  />
))
SidebarFooter.displayName = "SidebarFooter"

const SidebarMenu = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("my-1", className)}
    {...props}
  />
))
SidebarMenu.displayName = "SidebarMenu"

const SidebarMenuItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex", className)}
    {...props}
  />
))
SidebarMenuItem.displayName = "SidebarMenuItem"

const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    asChild?: boolean
  }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? "div" : "button"
  return (
    <Comp
      ref={ref}
      className={cn(
        "sidebar-link hover:sidebar-link-hover inline-flex h-10 w-full items-center justify-start whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium text-foreground [a&]:no-underline [&[data-slot=sidebar-menu-button]]:rounded-md [&[data-slot=sidebar-menu-button]]:p-2",
        className
      )}
      data-slot="sidebar-menu-button"
      {...props}
    />
  )
})
SidebarMenuButton.displayName = "SidebarMenuButton"

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} 