import { Output, generateText } from "ai"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { createOpenAI } from "@ai-sdk/openai"
import { createServerFn } from "@tanstack/react-start"

import { graphql } from "@/graphql"
import { execute } from "@/graphql/execute"
import {
  analyzedReceiptDraftSchema,
  analyzeReceiptInputSchema,
  createReceiptUploadInputSchema,
  saveReceiptInputSchema,
} from "@/features/scan/types"
import {
  downloadReceiptObject,
  getStoredImageReference,
  createPresignedReceiptUploadUrl,
} from "@/lib/r2"
import {
  calculateItemTotal,
  isValidBrazilCnpj,
  normalizeOcrText,
  normalizeVendorTaxId,
} from "@/features/scan/utils"

type OcrProvider = "gemini" | "modal"

const ScanBootstrapQuery = graphql(`
  query ScanBootstrap {
    users(order_by: [{ fullName: Asc }]) {
      id
      fullName
      companyId
    }
  }
`)

const UserContextQuery = graphql(`
  query ScanUserContext($id: Uuid!) {
    usersById(id: $id) {
      id
      fullName
      companyId
    }
  }
`)

const InsertReceiptMutation = graphql(`
  mutation InsertScanReceipt($objects: [InsertReceiptsObjectInput!]!) {
    insertReceipts(objects: $objects) {
      returning {
        id
        vendorName
        receiptDate
        totalAmount
        status
        imageUrl
        userId
        vendorTaxId
        vendorTaxIdValid
        companyId
      }
    }
  }
`)

const InsertReceiptItemsMutation = graphql(`
  mutation InsertScanReceiptItems($objects: [InsertReceiptItemsObjectInput!]!) {
    insertReceiptItems(objects: $objects) {
      affectedRows
      returning {
        id
        description
        category
        quantity
        unitPrice
        totalPrice
      }
    }
  }
`)

const persistedReceiptStatus = "extracted"
const modalOcrEndpoint = "https://0xthiagomartins--glm-ocr-ocr.modal.run"

function getParserModel() {
  if (process.env.GOOGLE_AI_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return process.env.GOOGLE_AI_MODEL ?? "gemini-2.5-flash"
  }

  return process.env.OPENAI_MODEL ?? "gpt-4.1-mini"
}

function getParserProvider() {
  const googleApiKey =
    process.env.GOOGLE_AI_KEY ?? process.env.GOOGLE_GENERATIVE_AI_API_KEY

  if (googleApiKey) {
    return createGoogleGenerativeAI({ apiKey: googleApiKey })
  }

  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    throw new Error(
      "Add GOOGLE_AI_KEY or OPENAI_API_KEY before running receipt analysis."
    )
  }

  return createOpenAI({ apiKey })
}

function getGoogleVisionProvider() {
  const googleApiKey =
    process.env.GOOGLE_AI_KEY ?? process.env.GOOGLE_GENERATIVE_AI_API_KEY

  if (!googleApiKey) {
    throw new Error("GOOGLE_AI_KEY is required for receipt OCR.")
  }

  return createGoogleGenerativeAI({ apiKey: googleApiKey })
}

function getGoogleVisionModel() {
  return (
    process.env.GOOGLE_AI_VISION_MODEL ??
    process.env.GOOGLE_AI_MODEL ??
    "gemini-2.5-flash"
  )
}

async function fetchUserContext(userId: string) {
  const data = await execute(UserContextQuery, { id: userId })
  const user = data.usersById

  if (!user) {
    throw new Error("The selected employee could not be found.")
  }

  return user
}

async function persistReceipt(input: {
  companyId: string
  imageReference?: string
  items: Array<{
    category?: string
    name: string
    quantity: number
    unitPrice: number
  }>
  receiptDate: string
  status: string
  totalAmount: number
  userId: string
  vendorName: string
  vendorTaxId?: string
}) {
  const normalizedVendorTaxId = normalizeVendorTaxId(input.vendorTaxId ?? "")

  const receiptData = await execute(InsertReceiptMutation, {
    objects: [
      {
        companyId: input.companyId,
        imageUrl: input.imageReference,
        receiptDate: input.receiptDate,
        status: input.status,
        totalAmount: input.totalAmount.toFixed(2),
        userId: input.userId,
        vendorName: input.vendorName,
        vendorTaxId: normalizedVendorTaxId || undefined,
        vendorTaxIdValid: normalizedVendorTaxId
          ? isValidBrazilCnpj(normalizedVendorTaxId)
          : false,
      },
    ],
  })

  const savedReceipt = receiptData.insertReceipts.returning[0]

  if (!savedReceipt) {
    throw new Error("The receipt could not be saved.")
  }

  const itemsData = await execute(InsertReceiptItemsMutation, {
    objects: input.items.map((item) => ({
      category: item.category || undefined,
      description: item.name,
      quantity: item.quantity.toFixed(2),
      receiptId: savedReceipt.id,
      totalPrice: calculateItemTotal(item.quantity, item.unitPrice).toFixed(2),
      unitPrice: item.unitPrice.toFixed(2),
    })),
  })

  return {
    receipt: savedReceipt,
    items: itemsData.insertReceiptItems.returning,
  }
}

async function parseReceiptText(ocrText: string) {
  const provider = getParserProvider()
  const { output } = await generateText({
    model: provider(getParserModel()),
    output: Output.object({
      name: "ReceiptDraft",
      description: "Normalized receipt data extracted from OCR text.",
      schema: analyzedReceiptDraftSchema,
    }),
    prompt: `
Extract a normalized B2B receipt draft from the OCR text below.

Rules:
- Return receiptDate as YYYY-MM-DD.
- Return totalAmount, quantity, and unitPrice as numbers using decimal dots.
- Normalize product names into concise readable labels.
- Infer a short product category when possible. Use an empty string when unsure.
- If a CNPJ or vendor tax ID is visible, return digits only in vendorTaxId. Otherwise use an empty string.
- Include only purchased items. Ignore subtotals, taxes, payment lines, and metadata.
- Preserve the vendor name from the source text.
- If the OCR looks ambiguous, choose the most likely structured interpretation instead of inventing extra items.

OCR text:
${ocrText}
    `.trim(),
  })

  return output
}

async function runGeminiVisionOcr(input: {
  buffer: Buffer
  contentType?: string
}) {
  const visionProvider = getGoogleVisionProvider()
  const { text } = await generateText({
    model: visionProvider(getGoogleVisionModel()),
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `
Read this receipt image and return plain OCR text only.

Rules:
- Transcribe all visible receipt text.
- Preserve useful line breaks.
- Do not summarize.
- Do not add markdown, code fences, labels, or explanations.
- If any part is unclear, still return the best raw transcription you can.
            `.trim(),
          },
          {
            type: "image",
            image: input.buffer,
            mediaType: input.contentType,
          },
        ],
      },
    ],
  })

  return text
}

async function runModalOcr(input: { buffer: Buffer }) {
  const response = await fetch(modalOcrEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      image_b64: input.buffer.toString("base64"),
    }),
  })

  if (!response.ok) {
    throw new Error(
      "Receipt OCR failed. Try another photo or enter the items manually."
    )
  }

  const payload = (await response.json()) as { error?: string; text?: string }

  if (payload.error) {
    throw new Error(
      "Receipt OCR failed. Try another photo or enter the items manually."
    )
  }

  return payload.text ?? ""
}

async function runOcr(input: {
  buffer: Buffer
  contentType?: string
  provider: OcrProvider
}) {
  const rawText =
    input.provider === "modal"
      ? await runModalOcr({ buffer: input.buffer })
      : await runGeminiVisionOcr({
          buffer: input.buffer,
          contentType: input.contentType,
        })

  const cleanedText = normalizeOcrText(rawText)

  if (!cleanedText) {
    throw new Error(
      "This image could not be read clearly. Try another photo or enter the items manually."
    )
  }

  return cleanedText
}

function resolveOcrProvider(): OcrProvider {
  if (process.env.GOOGLE_AI_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return "gemini"
  }

  return "modal"
}

async function runOcrFromR2(input: { objectKey: string }) {
  const storedObject = await downloadReceiptObject(input.objectKey)

  return runOcr({
    buffer: storedObject.buffer,
    contentType: storedObject.contentType,
    provider: resolveOcrProvider(),
  })
}

export const getScanBootstrap = createServerFn({ method: "GET" }).handler(
  async () => {
    const data = await execute(ScanBootstrapQuery)

    return {
      users: (data.users ?? []).map((user) => ({
        companyId: user.companyId,
        fullName: user.fullName,
        id: user.id,
      })),
    }
  }
)

export const createReceiptUploadUrl = createServerFn({ method: "POST" })
  .inputValidator((input) => createReceiptUploadInputSchema.parse(input))
  .handler(async ({ data }) => {
    return createPresignedReceiptUploadUrl(data)
  })

export const analyzeReceiptFromR2 = createServerFn({ method: "POST" })
  .inputValidator((input) => analyzeReceiptInputSchema.parse(input))
  .handler(async ({ data }) => {
    await fetchUserContext(data.userId)

    const ocrText = await runOcrFromR2({ objectKey: data.objectKey })

    try {
      return await parseReceiptText(ocrText)
    } catch {
      throw new Error(
        "Receipt text was read, but the structured extraction failed. You can retry or enter the items manually."
      )
    }
  })

export const saveReceiptDraft = createServerFn({ method: "POST" })
  .inputValidator((input) => saveReceiptInputSchema.parse(input))
  .handler(async ({ data }) => {
    const user = await fetchUserContext(data.userId)
    const saved = await persistReceipt({
      companyId: user.companyId,
      imageReference: data.objectKey
        ? getStoredImageReference(data.objectKey)
        : undefined,
      items: data.items,
      receiptDate: data.receiptDate,
      status: persistedReceiptStatus,
      totalAmount: data.totalAmount,
      userId: data.userId,
      vendorName: data.vendorName,
      vendorTaxId: data.vendorTaxId,
    })

    return {
      receiptId: saved.receipt.id,
      savedReceipt: saved,
    }
  })
