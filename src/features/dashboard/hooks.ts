import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"

import type {
  DashboardPeriod,
  DashboardReceiptDetailResult,
  DashboardSnapshot,
} from "@/features/dashboard/server"
import { getDashboardCategoryOptions } from "@/features/dashboard/model"
import {
  getDashboardSnapshot,
  getReceiptDetail,
} from "@/features/dashboard/server"

export const dashboardQueryKey = ["dashboard-bootstrap"] as const

const dashboardPeriodStorageKey = "dashboard:period"

const validPeriods = new Set<DashboardPeriod>(["7d", "30d", "90d", "all"])

const emptySummary = {
  receiptsProcessed: 0,
  totalSpent: 0,
  uniqueEmployees: 0,
  uniqueProducts: 0,
}

export function getEmptyDashboardSnapshot(): DashboardSnapshot {
  return {
    alerts: [],
    categories: getDashboardCategoryOptions().map((option) => ({
      key: option.key,
      label: option.label,
      ratio: 0,
      total: 0,
    })),
    employees: [],
    receipts: [],
    products: [],
    summary: emptySummary,
  }
}

export function useDashboardPeriod(defaultValue: DashboardPeriod = "30d") {
  const [period, setPeriod] = React.useState<DashboardPeriod>(defaultValue)

  React.useEffect(() => {
    const storedValue = window.localStorage.getItem(dashboardPeriodStorageKey)

    if (storedValue && validPeriods.has(storedValue as DashboardPeriod)) {
      setPeriod(storedValue as DashboardPeriod)
    }
  }, [])

  React.useEffect(() => {
    window.localStorage.setItem(dashboardPeriodStorageKey, period)
  }, [period])

  return { period, setPeriod }
}

export function useDashboardSnapshot(period: DashboardPeriod) {
  const dashboardServerFn = useServerFn(getDashboardSnapshot)

  return useQuery({
    queryKey: [...dashboardQueryKey, period],
    queryFn: () => dashboardServerFn({ data: period }),
    refetchInterval: 5_000,
    refetchOnWindowFocus: true,
  })
}

export function useReceiptDetail(receiptId: string | null) {
  const receiptDetailServerFn = useServerFn(getReceiptDetail)

  return useQuery<DashboardReceiptDetailResult>({
    enabled: Boolean(receiptId),
    queryKey: ["receipt-detail", receiptId],
    queryFn: async () => {
      if (!receiptId) {
        throw new Error("Selecione um recibo antes de carregar os detalhes.")
      }

      return receiptDetailServerFn({
        data: receiptId,
      })
    },
  })
}
