import { Link, useRouterState } from "@tanstack/react-router"
import {
  LayoutDashboard,
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
      <SidebarHeader className=" pb-3">
        <div className=" px-2 py-4">


          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="font-display text-4xl font-bold tracking-tight">
              Track
            </p>


          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton
                    className="h-12 rounded-2xl px-4 text-base font-medium text-sidebar-foreground/90 hover:bg-white/8 hover:text-white data-active:bg-white data-active:text-[#04342C] data-active:font-semibold data-active:shadow-[0_10px_24px_rgba(0,0,0,0.16)] [&_svg]:size-5"
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
