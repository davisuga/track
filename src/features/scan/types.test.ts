import { describe, expect, it } from "vitest"

import {
  analyzeReceiptInputSchema,
  createReceiptUploadInputSchema,
  graphQlUuidSchema,
  saveReceiptInputSchema,
} from "@/features/scan/types"
import {
  formatVendorTaxId,
  isValidBrazilCnpj,
  normalizeOcrText,
  normalizeVendorTaxId,
} from "@/features/scan/utils"

describe("graphQlUuidSchema", () => {
  it("accepts repo seed ids that are not RFC UUID variants", () => {
    const seededUserId = "22222222-2222-2222-2222-222222222221"

    expect(graphQlUuidSchema.parse(seededUserId)).toBe(seededUserId)
  })

  it("rejects non-uuid-shaped strings", () => {
    expect(() => graphQlUuidSchema.parse("not-a-uuid")).toThrow("Invalid UUID")
  })
})

describe("scan input schemas", () => {
  const seededUserId = "22222222-2222-2222-2222-222222222221"

  it("accepts the seeded user id across server-function inputs", () => {
    expect(
      createReceiptUploadInputSchema.parse({
        contentType: "image/jpeg",
        fileName: "receipt.jpg",
        userId: seededUserId,
      })
    ).toMatchObject({ userId: seededUserId })

    expect(
      analyzeReceiptInputSchema.parse({
        objectKey: "receipts/u/test.jpg",
        userId: seededUserId,
      })
    ).toMatchObject({ userId: seededUserId })

    expect(
      saveReceiptInputSchema.parse({
        items: [
          {
            category: "Pantry",
            id: "item-1",
            name: "Coffee Beans",
            quantity: 2,
            unitPrice: 10,
          },
        ],
        receiptDate: "2026-03-14",
        totalAmount: 20,
        userId: seededUserId,
        vendorName: "Vendor",
        vendorTaxId: "11.444.777/0001-61",
      })
    ).toMatchObject({
      userId: seededUserId,
      vendorTaxId: "11.444.777/0001-61",
    })
  })
})

describe("normalizeOcrText", () => {
  it("removes OCR control tokens and recognition prefix", () => {
    expect(
      normalizeOcrText(
        "<|image|><|image|>Text Recognition:\n\nLine 1\nLine 2\r\n"
      )
    ).toBe("Line 1\nLine 2")
  })
})

describe("vendor tax id helpers", () => {
  it("normalizes and formats a CNPJ", () => {
    expect(normalizeVendorTaxId("11.444.777/0001-61")).toBe("11444777000161")
    expect(formatVendorTaxId("11444777000161")).toBe("11.444.777/0001-61")
  })

  it("validates a real-looking CNPJ checksum", () => {
    expect(isValidBrazilCnpj("11.444.777/0001-61")).toBe(true)
    expect(isValidBrazilCnpj("11.444.777/0001-62")).toBe(false)
  })
})
