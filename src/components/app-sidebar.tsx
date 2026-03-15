import { Link, useRouterState } from "@tanstack/react-router"
import {
  LayoutDashboard,
  Receipt,
  ReceiptText,
  ScanLine,
  Users,
} from "lucide-react"
import { useTranslation } from "react-i18next"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

type NavigationItem = {
  icon: typeof LayoutDashboard
  isActive: boolean
  label: string
  to: "/" | "/scan" | "/receitas" | "/funcionarios"
}

export function AppSidebar() {
  const { t } = useTranslation()
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  const navigationItems: Array<NavigationItem> = [
    {
      icon: LayoutDashboard,
      isActive: pathname === "/",
      label: t("app.nav.dashboard"),
      to: "/",
    },
    {
      icon: ScanLine,
      isActive: pathname.startsWith("/scan"),
      label: t("app.nav.capture"),
      to: "/scan",
    },
    {
      icon: ReceiptText,
      isActive: pathname.startsWith("/receitas"),
      label: t("app.nav.receipts"),
      to: "/receitas",
    },
    {
      icon: Users,
      isActive: pathname.startsWith("/funcionarios"),
      label: t("app.nav.employees"),
      to: "/funcionarios",
    },
  ]

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader className="p-3">
        <div className="rounded-[28px] border border-sidebar-border/80 bg-sidebar-accent px-4 py-4 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent text-accent-fg">
              <Receipt size={20} />
            </div>
            <div className="min-w-0 group-data-[collapsible=icon]:hidden">
              <p className="font-display text-lg font-bold tracking-tight">
                ReceiptIQ
              </p>
              <p className="text-sm text-text-secondary">
                {t("app.sidebar.description")}
              </p>
            </div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t("app.sidebar.navigation")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton
                    isActive={item.isActive}
                    render={
                      <Link
                        activeOptions={{ exact: item.to === "/" }}
                        to={item.to}
                      />
                    }
                    tooltip={item.label}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  )
}
