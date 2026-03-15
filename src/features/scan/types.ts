import * as z from "zod"

import {
  createReceiptItemId,
  getTodayDate,
  sumItemTotals,
} from "@/features/scan/utils"

export const graphQlUuidSchema = z
  .string()
  .regex(
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
    "Invalid UUID"
  )

export const receiptItemInputSchema = z.object({
  name: z.string().trim().min(1, "Item name is required."),
  category: z.string().trim().max(80).optional().default(""),
  quantity: z.number().positive("Quantity must be greater than zero."),
  unitPrice: z.number().nonnegative("Unit price must be zero or more."),
})

export const analyzedReceiptDraftSchema = z.object({
  vendorName: z.string().trim().min(1, "Supplier is required."),
  vendorTaxId: z.string().trim().max(32).optional().default(""),
  receiptDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD."),
  totalAmount: z.number().nonnegative("Total must be zero or more."),
  items: z
    .array(receiptItemInputSchema)
    .min(1, "At least one item is required."),
})

export const editableReceiptItemSchema = receiptItemInputSchema.extend({
  id: z.string().min(1),
})

export const editableReceiptDraftSchema = analyzedReceiptDraftSchema.extend({
  items: z.array(editableReceiptItemSchema),
})

export const createReceiptUploadInputSchema = z.object({
  userId: graphQlUuidSchema,
  fileName: z.string().trim().min(1),
  contentType: z.string().trim().min(1),
})

export const createUploadUrlResultSchema = z.object({
  objectKey: z.string().min(1),
  uploadUrl: z.string().url(),
  contentType: z.string().min(1),
})

export const analyzeReceiptInputSchema = z.object({
  objectKey: z.string().min(1),
  userId: graphQlUuidSchema,
})

export const saveReceiptInputSchema = z.object({
  objectKey: z.string().min(1).optional(),
  userId: graphQlUuidSchema,
  vendorName: analyzedReceiptDraftSchema.shape.vendorName,
  vendorTaxId: analyzedReceiptDraftSchema.shape.vendorTaxId,
  receiptDate: analyzedReceiptDraftSchema.shape.receiptDate,
  totalAmount: analyzedReceiptDraftSchema.shape.totalAmount,
  items: z.array(editableReceiptItemSchema).min(1, "Add at least one item."),
})

export type ReceiptItemInput = z.infer<typeof receiptItemInputSchema>
export type EditableReceiptItem = z.infer<typeof editableReceiptItemSchema>
export type AnalyzedReceiptDraft = z.infer<typeof analyzedReceiptDraftSchema>
export type EditableReceiptDraft = z.infer<typeof editableReceiptDraftSchema>
export type CreateUploadUrlResult = z.infer<typeof createUploadUrlResultSchema>
export type AnalyzeReceiptInput = z.infer<typeof analyzeReceiptInputSchema>
export type SaveReceiptInput = z.infer<typeof saveReceiptInputSchema>

export function toEditableReceiptDraft(
  draft: Pick<
    AnalyzedReceiptDraft,
    "vendorName" | "vendorTaxId" | "receiptDate" | "totalAmount" | "items"
  >
): EditableReceiptDraft {
  return {
    vendorName: draft.vendorName,
    vendorTaxId: draft.vendorTaxId,
    receiptDate: draft.receiptDate,
    totalAmount: draft.totalAmount,
    items: draft.items.map((item) => ({
      id: createReceiptItemId(),
      ...item,
      category: item.category ?? "",
    })),
  }
}

export function createEmptyReceiptDraft() {
  return {
    vendorName: "",
    vendorTaxId: "",
    receiptDate: getTodayDate(),
    totalAmount: 0,
    items: [] satisfies EditableReceiptItem[],
  }
}

export function createEmptyReceiptItem(): EditableReceiptItem {
  return {
    id: createReceiptItemId(),
    name: "",
    category: "",
    quantity: 1,
    unitPrice: 0,
  }
}

export function syncDraftTotalFromItems(
  draft: EditableReceiptDraft
): EditableReceiptDraft {
  return {
    ...draft,
    totalAmount: sumItemTotals(draft.items),
  }
}
