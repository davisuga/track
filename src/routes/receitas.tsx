import * as React from "react"
import { Link, createFileRoute } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"

import {
  getEmptyDashboardSnapshot,
  useDashboardPeriod,
  useDashboardSnapshot,
  useReceiptDetail,
} from "@/features/dashboard/hooks"
import { ReceiptHistoryTable } from "@/features/dashboard/tables"
import {
  DashboardErrorState,
  DashboardLoadingState,
  DashboardPageFrame,
  EmptyState,
  NoReceiptsCta,
  ReceiptDetailModal,
  SectionCard,
} from "@/features/dashboard/ui"

export const Route = createFileRoute("/receitas")({
  component: ReceiptsRoute,
})

function ReceiptsRoute() {
  const { t } = useTranslation()
  const { period, setPeriod } = useDashboardPeriod()
  const dashboardQuery = useDashboardSnapshot(period)
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
  const selectedReceipt =
    view.receipts.find((receipt) => receipt.id === selectedReceiptId) ?? null

  return (
    <>
      <DashboardPageFrame
        description={t("dashboard.pages.receiptsDescription")}
        period={period}
        setPeriod={setPeriod}
        title={t("dashboard.pages.receiptsTitle")}
      >
        <SectionCard
          description={t("dashboard.sections.history.description")}
          title={t("dashboard.sections.history.title")}
        >
          {view.receipts.length ? (
            <ReceiptHistoryTable
              onSelectReceipt={setSelectedReceiptId}
              receipts={view.receipts}
            />
          ) : (
            <EmptyState
              cta={
                <Link className="text-sm font-semibold underline" to="/scan">
                  {t("dashboard.sections.history.cta")}
                </Link>
              }
              message={t("dashboard.sections.history.empty")}
            />
          )}
        </SectionCard>

        {!view.receipts.length ? <NoReceiptsCta /> : null}
      </DashboardPageFrame>

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
