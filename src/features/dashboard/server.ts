import { createServerFn } from "@tanstack/react-start"

import {
  DASHBOARD_CATEGORY_OPTIONS,
  type DashboardBootstrap,
  type DashboardCategoryKey,
  type DashboardPolicyLimit,
  type DashboardReceipt,
} from "@/features/dashboard/model"
import { graphQlUuidSchema } from "@/features/scan/types"
import type { TypedDocumentString } from "@/graphql/graphql"
import { execute } from "@/graphql/execute"
import { createSignedReceiptReadUrl } from "@/lib/r2"

type DashboardBootstrapQuery = {
  categorySpendLimits?: Array<{
    category: DashboardCategoryKey
    companyId: string
    createdAt?: string | null
    id: string
    maxReceiptAmount: string
  }> | null
  receipts?: Array<{
    companyId?: string | null
    createdAt?: string | null
    id: string
    imageUrl?: string | null
    receiptDate: string
    receiptItems?: Array<{
      category?: string | null
      description: string
      id: string
      isPriceAnomaly?: boolean | null
      quantity?: string | null
      totalPrice: string
      unitPrice: string
    }> | null
    status?: string | null
    totalAmount: string
    userId: string
    user?: {
      fullName: string
    } | null
    vendorName: string
    vendorTaxId?: string | null
    vendorTaxIdValid: boolean
  }> | null
  users?: Array<{
    companyId: string
    fullName: string
    id: string
  }> | null
}

type ReceiptDetailQuery = {
  receiptsById?: {
    createdAt?: string | null
    id: string
    imageUrl?: string | null
    receiptDate: string
    receiptItems?: Array<{
      category?: string | null
      description: string
      id: string
      isPriceAnomaly?: boolean | null
      quantity?: string | null
      totalPrice: string
      unitPrice: string
    }> | null
    status?: string | null
    totalAmount: string
    userId: string
    user?: {
      fullName: string
    } | null
    vendorName: string
    vendorTaxId?: string | null
    vendorTaxIdValid: boolean
  } | null
}

type InsertPolicyMutation = {
  insertCategorySpendLimits: {
    returning: Array<{
      category: DashboardCategoryKey
      companyId: string
      id: string
      maxReceiptAmount: string
    }>
  }
}

const DashboardBootstrapQueryDocument = `
  query DashboardBootstrap {
    users(order_by: [{ fullName: Asc }]) {
      id
      companyId
      fullName
    }
    categorySpendLimits(order_by: [{ category: Asc }]) {
      id
      category
      companyId
      createdAt
      maxReceiptAmount
    }
    receipts(order_by: [{ receiptDate: Desc }, { createdAt: Desc }]) {
      companyId
      id
      createdAt
      imageUrl
      receiptDate
      status
      totalAmount
      userId
      vendorName
      vendorTaxId
      vendorTaxIdValid
      user {
        fullName
      }
      receiptItems(order_by: [{ totalPrice: Desc }, { description: Asc }]) {
        id
        category
        description
        isPriceAnomaly
        quantity
        totalPrice
        unitPrice
      }
    }
  }
` as unknown as TypedDocumentString<
  DashboardBootstrapQuery,
  Record<string, never>
>

const ReceiptDetailQueryDocument = `
  query DashboardReceiptDetail($id: Uuid!) {
    receiptsById(id: $id) {
      id
      createdAt
      imageUrl
      receiptDate
      status
      totalAmount
      userId
      vendorName
      vendorTaxId
      vendorTaxIdValid
      user {
        fullName
      }
      receiptItems(order_by: [{ totalPrice: Desc }, { description: Asc }]) {
        id
        category
        description
        isPriceAnomaly
        quantity
        totalPrice
        unitPrice
      }
    }
  }
` as unknown as TypedDocumentString<ReceiptDetailQuery, { id: string }>

const InsertPolicyMutationDocument = `
  mutation InsertDashboardPolicy($objects: [InsertCategorySpendLimitsObjectInput!]!) {
    insertCategorySpendLimits(objects: $objects) {
      returning {
        id
        category
        companyId
        maxReceiptAmount
      }
    }
  }
` as unknown as TypedDocumentString<
  InsertPolicyMutation,
  {
    objects: Array<{
      category: DashboardCategoryKey
      companyId: string
      maxReceiptAmount: string
    }>
  }
>

function toNumber(value: string | null | undefined) {
  const parsedValue = Number.parseFloat(value ?? "0")
  return Number.isFinite(parsedValue) ? parsedValue : 0
}

function normalizePolicy(policy: {
  category: DashboardCategoryKey
  companyId: string
  id: string
  maxReceiptAmount: string
}): DashboardPolicyLimit {
  return {
    category: policy.category,
    companyId: policy.companyId,
    id: policy.id,
    maxReceiptAmount: toNumber(policy.maxReceiptAmount),
  }
}

function normalizeReceipt(
  receipt: NonNullable<DashboardBootstrapQuery["receipts"]>[number]
): DashboardReceipt {
  return {
    createdAt: receipt.createdAt ?? null,
    id: receipt.id,
    imageRef: receipt.imageUrl ?? null,
    items: (receipt.receiptItems ?? []).map((item) => ({
      id: item.id,
      category: item.category ?? "",
      description: item.description,
      isPriceAnomaly: Boolean(item.isPriceAnomaly),
      quantity: toNumber(item.quantity),
      totalPrice: toNumber(item.totalPrice),
      unitPrice: toNumber(item.unitPrice),
    })),
    receiptDate: receipt.receiptDate,
    status: receipt.status ?? null,
    totalAmount: toNumber(receipt.totalAmount),
    userId: receipt.userId,
    userName: receipt.user?.fullName ?? "Funcionário desconhecido",
    vendorName: receipt.vendorName,
    vendorTaxId: receipt.vendorTaxId ?? "",
    vendorTaxIdValid: Boolean(receipt.vendorTaxIdValid),
  }
}

function resolveActiveCompanyId(data: DashboardBootstrapQuery) {
  const userCompanyId = data.users?.[0]?.companyId

  if (userCompanyId) {
    return userCompanyId
  }

  const receiptCompanyId = data.receipts?.[0]?.companyId

  if (receiptCompanyId) {
    return receiptCompanyId
  }

  return data.categorySpendLimits?.[0]?.companyId ?? null
}

function getObjectKeyFromImageReference(imageReference: string) {
  if (!imageReference.startsWith("r2://")) {
    return null
  }

  const remainder = imageReference.slice("r2://".length)
  const slashIndex = remainder.indexOf("/")

  if (slashIndex === -1) {
    return null
  }

  return remainder.slice(slashIndex + 1) || null
}

function sortPolicies(policies: DashboardPolicyLimit[]) {
  return [...policies].sort((left, right) => {
    const leftIndex = DASHBOARD_CATEGORY_OPTIONS.findIndex(
      (option) => option.key === left.category
    )
    const rightIndex = DASHBOARD_CATEGORY_OPTIONS.findIndex(
      (option) => option.key === right.category
    )

    return leftIndex - rightIndex
  })
}

async function ensureDefaultPolicies(
  companyId: string | null,
  policies: DashboardPolicyLimit[]
) {
  if (!companyId) {
    return []
  }

  const existingCategories = new Set(policies.map((policy) => policy.category))
  const missingPolicies = DASHBOARD_CATEGORY_OPTIONS.filter(
    (option) => !existingCategories.has(option.key)
  )

  if (!missingPolicies.length) {
    return sortPolicies(policies)
  }

  const insertedPolicies = await execute(InsertPolicyMutationDocument, {
    objects: missingPolicies.map((policy) => ({
      category: policy.key,
      companyId,
      maxReceiptAmount: policy.defaultLimit.toFixed(2),
    })),
  })

  return sortPolicies([
    ...policies,
    ...insertedPolicies.insertCategorySpendLimits.returning.map(
      normalizePolicy
    ),
  ])
}

export const getDashboardBootstrap = createServerFn({ method: "GET" }).handler(
  async () => {
    const data = await execute(DashboardBootstrapQueryDocument)
    const companyId = resolveActiveCompanyId(data)
    const users = (data.users ?? [])
      .filter((user) => !companyId || user.companyId === companyId)
      .map((user) => ({
        companyId: user.companyId,
        fullName: user.fullName,
        id: user.id,
      }))
    const policyLimits = await ensureDefaultPolicies(
      companyId,
      (data.categorySpendLimits ?? [])
        .filter((policy) => !companyId || policy.companyId === companyId)
        .map(normalizePolicy)
    )
    const receipts = (data.receipts ?? [])
      .filter((receipt) => !companyId || receipt.companyId === companyId)
      .map(normalizeReceipt)

    return {
      companyId,
      policyLimits,
      receipts,
      users,
    } satisfies DashboardBootstrap
  }
)

export const getReceiptDetail = createServerFn({ method: "POST" })
  .inputValidator((input) => graphQlUuidSchema.parse(input))
  .handler(async ({ data }) => {
    const result = await execute(ReceiptDetailQueryDocument, { id: data })
    const receipt = result.receiptsById

    if (!receipt) {
      throw new Error("Não foi possível encontrar o recibo selecionado.")
    }

    const normalizedReceipt = normalizeReceipt(receipt)
    const objectKey = normalizedReceipt.imageRef
      ? getObjectKeyFromImageReference(normalizedReceipt.imageRef)
      : null

    let signedImageUrl: string | null = null

    if (objectKey) {
      try {
        signedImageUrl = await createSignedReceiptReadUrl(objectKey)
      } catch {
        signedImageUrl = null
      }
    }

    return {
      receipt: normalizedReceipt,
      signedImageUrl,
    }
  })
