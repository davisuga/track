import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

import type { CreateUploadUrlResult } from "@/features/scan/types"
import {
  buildReceiptObjectKey,
  isSupportedReceiptMimeType,
  toStoredImageReference,
} from "@/features/scan/utils"

type R2Config = {
  accessKeyId: string
  bucketName: string
  endpoint: string
  secretAccessKey: string
}

function getR2Config(): R2Config {
  const endpoint = process.env.R2_ENDPOINT_URL
  const accessKeyId = process.env.R2_ACCESS_KEY_ID
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY
  const bucketName = process.env.R2_BUCKET_NAME

  if (!endpoint || !accessKeyId || !secretAccessKey || !bucketName) {
    throw new Error("R2 storage is not configured. Add the R2_* environment variables.")
  }

  return {
    endpoint,
    accessKeyId,
    secretAccessKey,
    bucketName,
  }
}

function createR2Client() {
  const config = getR2Config()

  return new S3Client({
    region: "auto",
    endpoint: config.endpoint,
    forcePathStyle: true,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  })
}

export async function createPresignedReceiptUploadUrl(input: {
  contentType: string
  fileName: string
  userId: string
}): Promise<CreateUploadUrlResult> {
  if (!isSupportedReceiptMimeType(input.contentType)) {
    throw new Error("Unsupported file type. Upload a JPG, PNG, WEBP, HEIC, or HEIF image.")
  }

  const client = createR2Client()
  const { bucketName } = getR2Config()
  const objectKey = buildReceiptObjectKey(input.userId, input.fileName, input.contentType)

  try {
    const uploadUrl = await getSignedUrl(
      client,
      new PutObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
        ContentType: input.contentType,
      }),
      { expiresIn: 60 * 5 },
    )

    return {
      objectKey,
      uploadUrl,
      contentType: input.contentType,
    }
  } finally {
    client.destroy()
  }
}

export async function downloadReceiptObject(objectKey: string) {
  const client = createR2Client()
  const { bucketName } = getR2Config()

  try {
    const response = await client.send(
      new GetObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
      }),
    )

    const bytes = await response.Body?.transformToByteArray()

    if (!bytes) {
      throw new Error("The uploaded receipt image could not be read from storage.")
    }

    return {
      buffer: Buffer.from(bytes),
      contentType: response.ContentType,
    }
  } finally {
    client.destroy()
  }
}

export async function createSignedReceiptReadUrl(objectKey: string, expiresIn = 60 * 5) {
  const client = createR2Client()
  const { bucketName } = getR2Config()

  try {
    return await getSignedUrl(
      client,
      new GetObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
      }),
      { expiresIn },
    )
  } finally {
    client.destroy()
  }
}

export function getStoredImageReference(objectKey: string) {
  const { bucketName } = getR2Config()

  return toStoredImageReference(bucketName, objectKey)
}
