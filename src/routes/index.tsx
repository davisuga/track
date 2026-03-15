import * as React from "react"
import { Link, createFileRoute } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"
import { useTranslation } from "react-i18next"
import {
  AlertTriangle,
  CalendarRange,
  ChevronDown,
  ChevronRight,
  Loader2,
  Package,
  ReceiptText,
  ScanLine,
  ShieldAlert,
  Users,
  X,
} from "lucide-react"
import { AnimatePresence, motion } from "motion/react"

import { Card } from "@/components/ui/card"
import {
  DASHBOARD_PERIODS,
  buildDashboardView,
  type DashboardPeriod,
} from "@/features/dashboard/model"
import {
  getDashboardBootstrap,
  getReceiptDetail,
} from "@/features/dashboard/server"
import {
  currencyFormatter,
  dateFormatter,
  numberFormatter,
  preciseCurrencyFormatter,
} from "@/lib/i18n"
import { formatVendorTaxId } from "@/features/scan/utils"

export const Route = createFileRoute("/")({
  component: DashboardRoute,
})

const dashboardQueryKey = ["dashboard-bootstrap"]

const categoryToneClasses = [
  "bg-[#1C1C1E]",
  "bg-[#505056]",
  "bg-[#7B7B83]",
  "bg-[#A9A9B0]",
  "bg-[#D8D8DD]",
] as const

function DashboardRoute() {
  const { t } = useTranslation()
  const dashboardServerFn = useServerFn(getDashboardBootstrap)
  const receiptDetailServerFn = useServerFn(getReceiptDetail)

  const [period, setPeriod] = React.useState<DashboardPeriod>("30d")
  const [expandedEmployeeId, setExpandedEmployeeId] = React.useState<
    string | null
  >(null)
  const [selectedReceiptId, setSelectedReceiptId] = React.useState<
    string | null
  >(null)
  const [dismissedAlertIds, setDismissedAlertIds] = React.useState<string[]>([])

  const dashboardQuery = useQuery({
    queryKey: dashboardQueryKey,
    queryFn: () => dashboardServerFn(),
    refetchInterval: 5_000,
    refetchOnWindowFocus: true,
  })

  const receiptDetailQuery = useQuery({
    enabled: Boolean(selectedReceiptId),
    queryKey: ["receipt-detail", selectedReceiptId],
    queryFn: async () => {
      if (!selectedReceiptId) {
        throw new Error("Selecione um recibo antes de carregar os detalhes.")
      }

      return receiptDetailServerFn({
        data: selectedReceiptId,
      })
    },
  })

  const dashboardData = dashboardQuery.data ?? {
    companyId: null,
    policyLimits: [],
    receipts: [],
    users: [],
  }

  const view = React.useMemo(
    () => buildDashboardView(dashboardData, period),
    [dashboardData, period]
  )

  const visibleAlerts = React.useMemo(
    () =>
      view.alerts
        .filter((alert) => !dismissedAlertIds.includes(alert.id))
        .slice(0, 8),
    [dismissedAlertIds, view.alerts]
  )

  const selectedReceipt =
    view.filteredReceipts.find((receipt) => receipt.id === selectedReceiptId) ??
    dashboardData.receipts.find(
      (receipt) => receipt.id === selectedReceiptId
    ) ??
    null

  React.useEffect(() => {
    if (!expandedEmployeeId) {
      return
    }

    const employeeStillVisible = view.employees.some(
      (employee) => employee.userId === expandedEmployeeId
    )

    if (!employeeStillVisible) {
      setExpandedEmployeeId(null)
    }
  }, [expandedEmployeeId, view.employees])

  if (dashboardQuery.isPending) {
    return (
      <div className="flex min-h-[calc(100vh-120px)] items-center justify-center p-6">
        <div className="flex items-center gap-3 text-sm text-text-secondary">
          <Loader2 className="animate-spin" size={18} />
          {t("dashboard.loading")}
        </div>
      </div>
    )
  }

  if (dashboardQuery.isError) {
    return (
      <div className="mx-auto flex min-h-[calc(100vh-120px)] max-w-md flex-col justify-center gap-4 p-6">
        <Card className="p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-1 text-danger" size={20} />
            <div className="space-y-2">
              <h1 className="font-display text-xl font-bold">
                {t("dashboard.unavailableTitle")}
              </h1>
              <p className="text-sm text-text-secondary">
                {dashboardQuery.error instanceof Error
                  ? dashboardQuery.error.message
                  : t("dashboard.unavailableFallback")}
              </p>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <>
      <div className="mx-auto flex min-h-[calc(100vh-120px)] w-full max-w-6xl flex-col gap-5 p-4 md:p-6">
        <motion.section
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-[32px] border border-border/60 bg-bg-surface shadow-floating"
          initial={{ opacity: 0, y: 18 }}
        >
          <div className="relative overflow-hidden px-5 py-6 md:px-7 md:py-7">
            <div className="absolute inset-x-0 top-0 h-28" />
            <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div className="max-w-2xl space-y-2">
                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border/70 bg-bg-base px-3 py-2 text-xs font-semibold tracking-[0.12em] text-text-secondary uppercase">
                  <CalendarRange size={14} />
                  {t("dashboard.badge")}
                </div>
                <div className="space-y-2">
                  <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
                    {t("dashboard.heroTitle")}
                  </h1>
                  <p className="max-w-xl text-sm leading-6 text-text-secondary md:text-base">
                    {t("dashboard.heroDescription")}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {DASHBOARD_PERIODS.map((option) => (
                  <button
                    key={option.id}
                    className={[
                      "rounded-full border px-4 py-3 font-display text-sm font-semibold transition",
                      period === option.id
                        ? "border-accent bg-accent text-accent-fg shadow-soft"
                        : "border-border bg-bg-base text-text-primary hover:bg-border/70",
                    ].join(" ")}
                    onClick={() => setPeriod(option.id)}
                    type="button"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
          initial={{ opacity: 0, y: 18 }}
          transition={{ delay: 0.04 }}
        >
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
        </motion.section>

        <SectionCard
          description={t("dashboard.sections.employee.description")}
          title={t("dashboard.sections.employee.title")}
        >
          {view.employees.length ? (
            <div className="space-y-3">
              {view.employees.map((employee, index) => {
                const isExpanded = expandedEmployeeId === employee.userId

                return (
                  <div
                    key={employee.userId}
                    className="rounded-[24px] border border-border/60 bg-bg-base/70 p-2 shadow-soft"
                  >
                    <button
                      className="flex w-full items-center gap-3 rounded-[20px] px-3 py-3 text-left transition hover:bg-white"
                      onClick={() =>
                        setExpandedEmployeeId((currentValue) =>
                          currentValue === employee.userId
                            ? null
                            : employee.userId
                        )
                      }
                      type="button"
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-bg-surface font-display text-sm font-bold shadow-soft">
                        #{index + 1}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate font-display text-lg font-bold">
                            {employee.userName}
                          </p>
                          <span className="rounded-full bg-bg-surface px-2 py-1 text-xs font-semibold text-text-secondary">
                            {employee.topCategory}
                          </span>
                        </div>
                        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-text-secondary">
                          <span>{employee.receiptCount} receipts</span>
                          <span>
                            {currencyFormatter.format(employee.totalSpent)}
                          </span>
                          <span>Top category: {employee.topCategory}</span>
                        </div>
                      </div>

                      {isExpanded ? (
                        <ChevronDown size={18} />
                      ) : (
                        <ChevronRight size={18} />
                      )}
                    </button>

                    <AnimatePresence initial={false}>
                      {isExpanded ? (
                        <motion.div
                          animate={{ height: "auto", opacity: 1 }}
                          className="overflow-hidden"
                          exit={{ height: 0, opacity: 0 }}
                          initial={{ height: 0, opacity: 0 }}
                        >
                          <div className="space-y-2 px-3 pt-1 pb-3">
                            {employee.receipts.map((receipt) => (
                              <button
                                key={receipt.id}
                                className="flex w-full items-center justify-between rounded-[20px] border border-border/60 bg-bg-surface px-4 py-3 text-left transition hover:translate-y-[-1px] hover:shadow-soft"
                                onClick={() => setSelectedReceiptId(receipt.id)}
                                type="button"
                              >
                                <div className="min-w-0">
                                  <p className="truncate font-semibold">
                                    {receipt.vendorName}
                                  </p>
                                  <p className="mt-1 text-sm text-text-secondary">
                                    {formatDate(receipt.receiptDate)} ·{" "}
                                    {receipt.items.length} items
                                  </p>
                                </div>
                                <p className="shrink-0 font-display font-bold">
                                  {currencyFormatter.format(
                                    receipt.totalAmount
                                  )}
                                </p>
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </div>
                )
              })}
            </div>
          ) : (
            <EmptyState
              cta={
                <Link className="text-sm font-semibold underline" to="/scan">
                  Process the first receipt
                </Link>
              }
              message="No employee activity exists in this period yet."
            />
          )}
        </SectionCard>

        <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
          <SectionCard
            description="Repeated small purchases and redundant buying become visible here."
            title="Top products"
          >
            {view.products.length ? (
              <div className="space-y-2">
                {view.products.slice(0, 10).map((product, index) => (
                  <div
                    key={`${product.name}-${index}`}
                    className="flex items-center gap-3 rounded-[24px] border border-border/60 bg-bg-base/70 px-4 py-4"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bg-surface font-display text-sm font-bold shadow-soft">
                      {index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display text-lg font-bold">
                        {product.name}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-text-secondary">
                        <span>{product.purchaseCount} times bought</span>
                        <span>{product.employeeCount} employees</span>
                        <span>
                          {currencyFormatter.format(product.totalSpent)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState message="No product-level spend was identified in this period." />
            )}
          </SectionCard>

          <SectionCard
            description="A ratio view of where money is going."
            title="Spend by category"
          >
            {view.summary.totalSpent > 0 ? (
              <div className="space-y-5">
                <div className="overflow-hidden rounded-full bg-bg-base">
                  <div className="flex h-5 w-full">
                    {view.categories.map((category, index) => (
                      <div
                        key={category.key}
                        className={categoryToneClasses[index]}
                        style={{ width: `${category.ratio * 100}%` }}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  {view.categories.map((category, index) => (
                    <div
                      key={category.key}
                      className="flex items-center justify-between rounded-[20px] border border-border/60 bg-bg-base/70 px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`h-3.5 w-3.5 rounded-full ${categoryToneClasses[index]}`}
                        />
                        <span className="font-medium">{category.label}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {Math.round(category.ratio * 100)}%
                        </p>
                        <p className="text-sm text-text-secondary">
                          {currencyFormatter.format(category.total)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <EmptyState message="No categorized spend is available for the selected period." />
            )}
          </SectionCard>
        </div>

        <SectionCard
          description="Concrete findings only: policy breaches, missing or invalid vendor tax IDs, duplicates, personal-looking purchases, bulk-buy patterns, and price spread."
          title="Alerts"
        >
          {visibleAlerts.length ? (
            <div className="space-y-2">
              {visibleAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-start gap-3 rounded-[24px] border border-border/60 bg-bg-base/70 px-4 py-4"
                >
                  <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bg-surface shadow-soft">
                    <ShieldAlert size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold tracking-[0.12em] text-text-secondary uppercase">
                      {alert.metric}
                    </p>
                    <p className="mt-1 leading-6">{alert.text}</p>
                  </div>
                  <button
                    className="rounded-full p-2 text-text-secondary transition hover:bg-bg-surface hover:text-text-primary"
                    onClick={() =>
                      setDismissedAlertIds((currentValue) => [
                        ...currentValue,
                        alert.id,
                      ])
                    }
                    type="button"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState message="No active alerts need attention in this period." />
          )}
        </SectionCard>

        <SectionCard
          description="Open any receipt to verify the source image and extracted lines at any time."
          title="Receipt history"
        >
          {view.filteredReceipts.length ? (
            <div className="space-y-2">
              {view.filteredReceipts.map((receipt) => (
                <button
                  key={receipt.id}
                  className="flex w-full items-center justify-between gap-4 rounded-[24px] border border-border/60 bg-bg-base/70 px-4 py-4 text-left transition hover:translate-y-[-1px] hover:bg-white hover:shadow-soft"
                  onClick={() => setSelectedReceiptId(receipt.id)}
                  type="button"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <p className="font-display text-lg font-bold">
                        {receipt.vendorName}
                      </p>
                      <span className="text-sm text-text-secondary">
                        {receipt.userName}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-text-secondary">
                      {formatDate(receipt.receiptDate)} · {receipt.items.length}{" "}
                      items
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-display text-lg font-bold">
                      {currencyFormatter.format(receipt.totalAmount)}
                    </p>
                    <p className="text-sm text-text-secondary">
                      Tap for detail
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <EmptyState
              cta={
                <Link className="text-sm font-semibold underline" to="/scan">
                  Scan receipts into this period
                </Link>
              }
              message="No receipts were submitted in the selected period."
            />
          )}
        </SectionCard>

        {!view.filteredReceipts.length && dashboardData.users.length > 0 ? (
          <Card className="rounded-[28px] border border-dashed border-border/80 bg-bg-surface p-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-bg-base shadow-soft">
              <ScanLine size={22} />
            </div>
            <h2 className="mt-4 font-display text-2xl font-bold">
              No receipts yet
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-text-secondary">
              The dashboard is ready. Once employees submit receipts, this
              screen will rank spend by person, show buying patterns, and
              enforce the policy limits above.
            </p>
            <div className="mt-5">
              <Link
                className="inline-flex items-center justify-center rounded-full bg-accent px-6 py-3 font-display font-semibold text-accent-fg shadow-soft transition hover:opacity-90"
                to="/scan"
              >
                <ScanLine className="mr-2" size={18} />
                Open scanner
              </Link>
            </div>
          </Card>
        ) : null}
      </div>

      <AnimatePresence>
        {selectedReceiptId ? (
          <motion.div
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-end bg-black/40 p-3 md:items-center md:justify-center md:p-6"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            onClick={() => setSelectedReceiptId(null)}
          >
            <motion.div
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-[32px] border border-border/60 bg-bg-surface shadow-floating"
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4 border-b border-border/60 px-5 py-4 md:px-6">
                <div>
                  <p className="text-xs font-semibold tracking-[0.12em] text-text-secondary uppercase">
                    Receipt detail
                  </p>
                  <h2 className="mt-1 font-display text-2xl font-bold">
                    {selectedReceipt?.vendorName ?? "Selected receipt"}
                  </h2>
                  {selectedReceipt ? (
                    <p className="mt-1 text-sm text-text-secondary">
                      {formatDate(selectedReceipt.receiptDate)} ·{" "}
                      {selectedReceipt.userName} ·{" "}
                      {currencyFormatter.format(selectedReceipt.totalAmount)}
                    </p>
                  ) : null}
                </div>
                <button
                  className="rounded-full bg-bg-base p-3 text-text-secondary transition hover:text-text-primary"
                  onClick={() => setSelectedReceiptId(null)}
                  type="button"
                >
                  <X size={18} />
                </button>
              </div>

              {receiptDetailQuery.isPending ? (
                <div className="flex min-h-[320px] items-center justify-center p-6">
                  <div className="flex items-center gap-3 text-sm text-text-secondary">
                    <Loader2 className="animate-spin" size={18} />
                    Loading receipt detail...
                  </div>
                </div>
              ) : receiptDetailQuery.isError ? (
                <div className="p-6">
                  <Card className="p-5">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="mt-1 text-danger" size={18} />
                      <div>
                        <p className="font-display text-lg font-bold">
                          Receipt detail unavailable
                        </p>
                        <p className="mt-1 text-sm text-text-secondary">
                          {receiptDetailQuery.error instanceof Error
                            ? receiptDetailQuery.error.message
                            : "The selected receipt could not be opened."}
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              ) : receiptDetailQuery.data ? (
                <div className="grid gap-0 md:grid-cols-2">
                  <div className="border-b border-border/60 bg-bg-base md:border-r md:border-b-0">
                    {receiptDetailQuery.data.signedImageUrl ? (
                      <img
                        alt={`Receipt from ${receiptDetailQuery.data.receipt.vendorName}`}
                        className="h-full max-h-[70vh] w-full object-contain"
                        src={receiptDetailQuery.data.signedImageUrl}
                      />
                    ) : (
                      <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 p-8 text-center text-text-secondary">
                        <ReceiptText size={28} />
                        <p className="max-w-xs text-sm leading-6">
                          No source image is available for this receipt, but the
                          extracted items remain visible for audit.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="max-h-[70vh] overflow-y-auto p-5 md:p-6">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <MiniStat
                        label="Supplier"
                        value={receiptDetailQuery.data.receipt.vendorName}
                      />
                      <MiniStat
                        label="Employee"
                        value={receiptDetailQuery.data.receipt.userName}
                      />
                      <MiniStat
                        label="Receipt date"
                        value={formatDate(
                          receiptDetailQuery.data.receipt.receiptDate
                        )}
                      />
                      <MiniStat
                        label="Total"
                        value={preciseCurrencyFormatter.format(
                          receiptDetailQuery.data.receipt.totalAmount
                        )}
                      />
                      <MiniStat
                        label="Vendor tax ID"
                        value={formatVendorTaxDisplay(
                          receiptDetailQuery.data.receipt.vendorTaxId,
                          receiptDetailQuery.data.receipt.vendorTaxIdValid
                        )}
                      />
                      <MiniStat
                        label="Status"
                        value={
                          receiptDetailQuery.data.receipt.status ?? "extracted"
                        }
                      />
                    </div>

                    <div className="mt-5 space-y-2">
                      {receiptDetailQuery.data.receipt.items.map((item) => (
                        <div
                          key={item.id}
                          className="rounded-[24px] border border-border/60 bg-bg-base/70 px-4 py-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold">
                                {item.description}
                              </p>
                              <p className="mt-1 text-sm text-text-secondary">
                                {item.category || "Other"} · Qty{" "}
                                {trimNumber(item.quantity)} ·{" "}
                                {preciseCurrencyFormatter.format(
                                  item.unitPrice
                                )}{" "}
                                each
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-display font-bold">
                                {preciseCurrencyFormatter.format(
                                  item.totalPrice
                                )}
                              </p>
                              {item.isPriceAnomaly ? (
                                <p className="mt-1 text-xs font-semibold tracking-[0.1em] text-danger uppercase">
                                  Price anomaly
                                </p>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  )
}

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <Card className="rounded-[28px] border border-border/60 p-5">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-bg-base shadow-soft">
        {icon}
      </div>
      <p className="mt-5 text-sm font-semibold tracking-[0.12em] text-text-secondary uppercase">
        {label}
      </p>
      <p className="mt-2 font-display text-3xl font-bold tracking-tight">
        {value}
      </p>
    </Card>
  )
}

function SectionCard({
  children,
  description,
  title,
}: {
  children: React.ReactNode
  description: string
  title: string
}) {
  return (
    <motion.section
      animate={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 18 }}
    >
      <Card className="rounded-[32px] border border-border/60 p-5 md:p-6">
        <div className="mb-5 space-y-1">
          <h2 className="font-display text-2xl font-bold">{title}</h2>
          <p className="text-sm leading-6 text-text-secondary">{description}</p>
        </div>
        {children}
      </Card>
    </motion.section>
  )
}

function EmptyState({
  cta,
  message,
}: {
  cta?: React.ReactNode
  message: string
}) {
  return (
    <div className="rounded-[24px] border border-dashed border-border/80 px-5 py-8 text-center">
      <p className="text-sm text-text-secondary">{message}</p>
      {cta ? <div className="mt-3">{cta}</div> : null}
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[24px] border border-border/60 bg-bg-base/70 px-4 py-4">
      <p className="text-xs font-semibold tracking-[0.12em] text-text-secondary uppercase">
        {label}
      </p>
      <p className="mt-2 font-display text-lg font-bold">{value}</p>
    </div>
  )
}

function formatDate(value: string) {
  return dateFormatter.format(new Date(`${value}T00:00:00`))
}

function trimNumber(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2)
}

function formatVendorTaxDisplay(
  vendorTaxId: string,
  vendorTaxIdValid: boolean
) {
  if (!vendorTaxId) {
    return "Missing"
  }

  if (vendorTaxIdValid) {
    return formatVendorTaxId(vendorTaxId)
  }

  return `${formatVendorTaxId(vendorTaxId)} (invalid)`
}
