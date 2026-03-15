import { Link, useRouterState } from "@tanstack/react-router"
import { LayoutDashboard, Receipt, ScanLine } from "lucide-react"
import { useTranslation } from "react-i18next"

import { cn } from "@/lib/utils"

export function AppHeader() {
  const { t } = useTranslation()
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  const isScanActive = pathname.startsWith("/scan")
  const isDashboardActive = pathname === "/"

  return (
    <div className="pointer-events-none sticky top-4 z-50 px-4">
      <div className="flex justify-center">
        <header className="pointer-events-auto flex w-full max-w-6xl items-center justify-between rounded-full border border-white/20 bg-bg-surface/80 p-2 shadow-floating backdrop-blur-xl">
          <div className="flex items-center gap-2 pl-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent">
              <Receipt className="text-accent-fg" size={16} />
            </div>
            <span className="font-display text-lg font-bold tracking-tight">
              ReceiptIQ
            </span>
          </div>

          <nav className="flex rounded-full border border-border/50 bg-bg-base p-1">
            <HeaderNavLink
              active={isScanActive}
              icon={<ScanLine className="mr-1.5" size={14} />}
              label={t("app.nav.capture")}
              to="/scan"
            />
            <HeaderNavLink
              active={isDashboardActive}
              icon={<LayoutDashboard className="mr-1.5" size={14} />}
              label={t("app.nav.dashboard")}
              to="/"
            />
          </nav>
        </header>
      </div>
    </div>
  )
}

function HeaderNavLink({
  active,
  icon,
  label,
  to,
}: {
  active: boolean
  icon: React.ReactNode
  label: string
  to: "/" | "/scan"
}) {
  return (
    <Link
      activeOptions={{ exact: to === "/" }}
      className={cn(
        "flex items-center rounded-full px-4 py-1.5 font-display text-sm font-semibold transition-all",
        active
          ? "bg-bg-surface text-text-primary shadow-sm"
          : "text-text-secondary hover:text-text-primary"
      )}
      to={to}
    >
      {icon}
      {label}
    </Link>
  )
}
