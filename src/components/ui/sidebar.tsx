"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// Custom hook for sidebar context
const SidebarContext = React.createContext<{
  isMobile?: boolean;
}>({
  isMobile: false,
})

export const useSidebar = () => React.useContext(SidebarContext)

const Sidebar = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement> & {
    className?: string
    collapsible?: boolean | "offcanvas"
    defaultCollapsed?: boolean
    position?: "left" | "right" | "top" | "bottom"
    toggled?: boolean
    onToggle?: (toggled: boolean) => void
    isMobile?: boolean
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
      isMobile = false,
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
      <SidebarContext.Provider value={{ isMobile }}>
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
      </SidebarContext.Provider>
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
    tooltip?: string
    size?: 'sm' | 'md' | 'lg'
  }
>(({ className, tooltip, size = 'md', ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "sidebar-link hover:sidebar-link-hover inline-flex w-full items-center justify-start whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium text-foreground [a&]:no-underline [&[data-slot=sidebar-menu-button]]:rounded-md [&[data-slot=sidebar-menu-button]]:p-2",
        {
          'h-8': size === 'sm',
          'h-10': size === 'md',
          'h-12': size === 'lg',
        },
        className
      )}
      data-slot="sidebar-menu-button"
      title={tooltip}
      {...props}
    />
  )
})
SidebarMenuButton.displayName = "SidebarMenuButton"

// Add the SidebarTrigger component
const SidebarTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "inline-flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground",
      className
    )}
    {...props}
  />
))
SidebarTrigger.displayName = "SidebarTrigger"

// Add the missing components
const SidebarGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("py-2", className)}
    {...props}
  />
))
SidebarGroup.displayName = "SidebarGroup"

const SidebarGroupLabel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("px-4 py-1 text-xs font-medium text-muted-foreground", className)}
    {...props}
  />
))
SidebarGroupLabel.displayName = "SidebarGroupLabel"

const SidebarGroupContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("px-2", className)}
    {...props}
  />
))
SidebarGroupContent.displayName = "SidebarGroupContent"

const SidebarMenuAction = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    showOnHover?: boolean
  }
>(({ className, showOnHover = false, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors",
      showOnHover && "opacity-0 group-hover:opacity-100",
      className
    )}
    {...props}
  />
))
SidebarMenuAction.displayName = "SidebarMenuAction"

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenuAction,
  SidebarTrigger,
}