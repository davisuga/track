const MIME_TYPE_EXTENSIONS: Record<string, string> = {
  "image/heic": "heic",
  "image/heif": "heif",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
}

export const SUPPORTED_RECEIPT_MIME_TYPES = Object.keys(MIME_TYPE_EXTENSIONS)

export function getTodayDate() {
  return new Date().toISOString().slice(0, 10)
}

export function createReceiptItemId() {
  return crypto.randomUUID()
}

export function roundCurrency(value: number) {
  return Math.round(value * 100) / 100
}

export function calculateItemTotal(quantity: number, unitPrice: number) {
  return roundCurrency(quantity * unitPrice)
}

export function sumItemTotals(
  items: Array<{ quantity: number; unitPrice: number }>
) {
  return roundCurrency(
    items.reduce(
      (sum, item) => sum + calculateItemTotal(item.quantity, item.unitPrice),
      0
    )
  )
}

export function getFileExtension(fileName: string, contentType: string) {
  const normalizedFileName = fileName.trim()
  const fileNameExtension = normalizedFileName.includes(".")
    ? normalizedFileName.split(".").pop()?.toLowerCase()
    : undefined

  if (fileNameExtension) {
    return fileNameExtension
  }

  return MIME_TYPE_EXTENSIONS[contentType] ?? "jpg"
}

export function isSupportedReceiptMimeType(contentType: string) {
  return SUPPORTED_RECEIPT_MIME_TYPES.includes(contentType)
}

export function buildReceiptObjectKey(
  userId: string,
  fileName: string,
  contentType: string
) {
  const extension = getFileExtension(fileName, contentType)
  const timestamp = new Date().toISOString().replaceAll(/[:.]/g, "-")
  const suffix = crypto.randomUUID().split("-")[0]

  return `receipts/${userId}/${timestamp}-${suffix}.${extension}`
}

export function toStoredImageReference(bucketName: string, objectKey: string) {
  return `r2://${bucketName}/${objectKey}`
}

export function normalizeVendorTaxId(value: string) {
  return value.replaceAll(/\D/g, "").trim()
}

export function isValidBrazilCnpj(value: string) {
  const digits = normalizeVendorTaxId(value)

  if (digits.length !== 14 || /^(\d)\1+$/.test(digits)) {
    return false
  }

  const baseDigits = digits.slice(0, 12).split("").map(Number)
  const firstCheckWeights = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  const secondCheckWeights = [6, ...firstCheckWeights]

  const firstCheckDigit = calculateCheckDigit(baseDigits, firstCheckWeights)
  const secondCheckDigit = calculateCheckDigit(
    [...baseDigits, firstCheckDigit],
    secondCheckWeights
  )

  return (
    digits === `${baseDigits.join("")}${firstCheckDigit}${secondCheckDigit}`
  )
}

export function formatVendorTaxId(value: string) {
  const digits = normalizeVendorTaxId(value)

  if (digits.length !== 14) {
    return digits
  }

  return digits.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    "$1.$2.$3/$4-$5"
  )
}

const CATEGORY_TRANSLATIONS: Record<string, string> = {
  beverage: "Bebidas",
  beverages: "Bebidas",
  cleaning: "Limpeza",
  food: "Alimentação",
  fuel: "Combustível",
  "office supplies": "Material de escritório",
  "office-supplies": "Material de escritório",
  other: "Outros",
}

export function normalizeReceiptCategory(value: string) {
  const normalizedValue = value.trim()

  if (!normalizedValue) {
    return ""
  }

  return CATEGORY_TRANSLATIONS[normalizedValue.toLowerCase()] ?? normalizedValue
}

export function normalizeOcrText(rawText: string) {
  return rawText
    .replaceAll("<|image|>", " ")
    .trimStart()
    .replace(/^Text Recognition:\s*/i, "")
    .replaceAll("\r", "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n")
}

export function toErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallback
}

function calculateCheckDigit(digits: Array<number>, weights: Array<number>) {
  const sum = digits.reduce((accumulator, digit, index) => {
    return accumulator + digit * weights[index]
  }, 0)
  const remainder = sum % 11

  return remainder < 2 ? 0 : 11 - remainder
}
