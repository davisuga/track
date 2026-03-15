import * as React from "react"
import { Link, createFileRoute } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"

import {
  getEmptyDashboardSnapshot,
  useDashboardPeriod,
  useDashboardSnapshot,
  useReceiptDetail,
} from "@/features/dashboard/hooks"
import { EmployeeSpendTable } from "@/features/dashboard/tables"
import {
  DashboardErrorState,
  DashboardLoadingState,
  DashboardPageFrame,
  EmployeeDrawer,
  EmptyState,
  ReceiptDetailModal,
  SectionCard,
} from "@/features/dashboard/ui"

export const Route = createFileRoute("/funcionarios")({
  component: EmployeesRoute,
})

function EmployeesRoute() {
  const { t } = useTranslation()
  const { period, setPeriod } = useDashboardPeriod()
  const dashboardQuery = useDashboardSnapshot(period)
  const [selectedEmployeeId, setSelectedEmployeeId] = React.useState<
    string | null
  >(null)
  const [selectedReceiptId, setSelectedReceiptId] = React.useState<
    string | null
  >(null)
  const receiptDetailQuery = useReceiptDetail(selectedReceiptId)

  if (dashboardQuery.isPending) {
    return <DashboardLoadingState />
  }

  if (dashboardQuery.isError) {
    return <DashboardErrorState error={dashboardQuery.error} />
  }

  const view = dashboardQuery.data ?? getEmptyDashboardSnapshot()
  const selectedEmployee =
    view.employees.find((employee) => employee.userId === selectedEmployeeId) ??
    null
  const selectedReceipt =
    view.receipts.find((receipt) => receipt.id === selectedReceiptId) ?? null

  return (
    <>
      <DashboardPageFrame
        description={t("dashboard.pages.employeesDescription")}
        period={period}
        setPeriod={setPeriod}
        title={t("dashboard.pages.employeesTitle")}
      >
        <SectionCard
          description={t("dashboard.sections.employee.description")}
          title={t("dashboard.sections.employee.title")}
        >
          {view.employees.length ? (
            <EmployeeSpendTable
              employees={view.employees}
              onSelectEmployee={setSelectedEmployeeId}
            />
          ) : (
            <EmptyState
              cta={
                <Link className="text-sm font-semibold underline" to="/scan">
                  {t("dashboard.sections.employee.cta")}
                </Link>
              }
              message={t("dashboard.sections.employee.empty")}
            />
          )}
        </SectionCard>
      </DashboardPageFrame>

      <EmployeeDrawer
        employee={selectedEmployee}
        onClose={() => setSelectedEmployeeId(null)}
        onSelectReceipt={setSelectedReceiptId}
      />

      <ReceiptDetailModal
        onClose={() => setSelectedReceiptId(null)}
        query={receiptDetailQuery}
        receiptId={selectedReceiptId}
        selectedReceiptMeta={
          selectedReceipt
            ? {
                receiptDate: selectedReceipt.receiptDate,
                totalAmount: selectedReceipt.totalAmount,
                userName: selectedReceipt.userName,
                vendorName: selectedReceipt.vendorName,
              }
            : null
        }
      />
    </>
  )
}
