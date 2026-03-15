import * as React from "react"
import { Link, createFileRoute } from "@tanstack/react-router"
import { Package, ReceiptText, Users } from "lucide-react"
import { useTranslation } from "react-i18next"

import { Card } from "@/components/ui/card"
import {
  getEmptyDashboardSnapshot,
  useDashboardPeriod,
  useDashboardSnapshot,
} from "@/features/dashboard/hooks"
import {
  CategoryBreakdown,
  DashboardAlertsList,
  DashboardErrorState,
  DashboardLoadingState,
  DashboardPageFrame,
  NoReceiptsCta,
  ProductHighlights,
  SectionCard,
  SummaryCard,
} from "@/features/dashboard/ui"
import { currencyFormatter, numberFormatter } from "@/lib/i18n"

export const Route = createFileRoute("/")({
  component: DashboardRoute,
})

function DashboardRoute() {
  const { t } = useTranslation()
  const { period, setPeriod } = useDashboardPeriod()
  const dashboardQuery = useDashboardSnapshot(period)
  const [dismissedAlertIds, setDismissedAlertIds] = React.useState<
    Array<string>
  >([])

  if (dashboardQuery.isPending) {
    return <DashboardLoadingState />
  }

  if (dashboardQuery.isError) {
    return <DashboardErrorState error={dashboardQuery.error} />
  }

  const view = dashboardQuery.data ?? getEmptyDashboardSnapshot()

  return (
    <DashboardPageFrame
      description={t("dashboard.pages.dashboardDescription")}
      period={period}
      setPeriod={setPeriod}
      title={t("dashboard.pages.dashboardTitle")}
    >
      <SectionCard
        description={t("dashboard.sections.alerts.description")}
        title={t("dashboard.sections.alerts.title")}
      >
        <DashboardAlertsList
          alerts={view.alerts}
          dismissedAlertIds={dismissedAlertIds}
          onDismiss={(alertId) =>
            setDismissedAlertIds((currentValue) => [...currentValue, alertId])
          }
        />
      </SectionCard>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          icon={<ReceiptText size={18} />}
          label={t("dashboard.summary.totalSpent")}
          value={currencyFormatter.format(view.summary.totalSpent)}
        />
        <SummaryCard
          icon={<ReceiptText size={18} />}
          label={t("dashboard.summary.receiptsProcessed")}
          value={numberFormatter.format(view.summary.receiptsProcessed)}
        />
        <SummaryCard
          icon={<Users size={18} />}
          label={t("dashboard.summary.employeesWhoSubmitted")}
          value={numberFormatter.format(view.summary.uniqueEmployees)}
        />
        <SummaryCard
          icon={<Package size={18} />}
          label={t("dashboard.summary.uniqueProducts")}
          value={numberFormatter.format(view.summary.uniqueProducts)}
        />
      </section>

      <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <SectionCard
          description={t("dashboard.sections.products.description")}
          title={t("dashboard.sections.products.title")}
        >
          <ProductHighlights products={view.products} />
        </SectionCard>

        <SectionCard
          description={t("dashboard.sections.categories.description")}
          title={t("dashboard.sections.categories.title")}
        >
          <CategoryBreakdown
            categories={view.categories}
            totalSpent={view.summary.totalSpent}
          />
        </SectionCard>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card className="rounded-[28px] border border-border/60 p-6">
          <p className="text-xs font-semibold tracking-[0.12em] text-text-secondary uppercase">
            {t("app.nav.receipts")}
          </p>
          <h2 className="mt-2 font-display text-2xl font-bold">
            {t("dashboard.sections.history.title")}
          </h2>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            {t("dashboard.sections.history.description")}
          </p>
          <Link
            className="mt-5 inline-flex rounded-full border border-border bg-bg-base px-4 py-3 font-display text-sm font-semibold text-text-primary transition hover:bg-border/70"
            to="/receitas"
          >
            {t("app.nav.receipts")}
          </Link>
        </Card>

        <Card className="rounded-[28px] border border-border/60 p-6">
          <p className="text-xs font-semibold tracking-[0.12em] text-text-secondary uppercase">
            {t("app.nav.employees")}
          </p>
          <h2 className="mt-2 font-display text-2xl font-bold">
            {t("dashboard.sections.employee.title")}
          </h2>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            {t("dashboard.sections.employee.description")}
          </p>
          <Link
            className="mt-5 inline-flex rounded-full border border-border bg-bg-base px-4 py-3 font-display text-sm font-semibold text-text-primary transition hover:bg-border/70"
            to="/funcionarios"
          >
            {t("app.nav.employees")}
          </Link>
        </Card>
      </div>

      {!view.receipts.length ? <NoReceiptsCta /> : null}
    </DashboardPageFrame>
  )
}
