import * as React from "react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"
import { useTranslation } from "react-i18next"
import {
  Camera,
  ImagePlus,
  Loader2,
  Sparkles,
  TriangleAlert,
  UserRound,
} from "lucide-react"
import { AnimatePresence, motion } from "motion/react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  createReceiptUploadUrl,
  getScanBootstrap,
  startReceiptParsing,
} from "@/features/scan/server"
import {
  SUPPORTED_RECEIPT_MIME_TYPES,
  toErrorMessage,
} from "@/features/scan/utils"

const lastUserStorageKey = "scan:last-user-id"

type CaptureErrorState = {
  message: string
}

export const Route = createFileRoute("/scan")({
  component: ScanCaptureRoute,
})

function ScanCaptureRoute() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const fileInputRef = React.useRef<HTMLInputElement | null>(null)
  const bootstrapServerFn = useServerFn(getScanBootstrap)
  const createUploadUrlServerFn = useServerFn(createReceiptUploadUrl)
  const startReceiptParsingServerFn = useServerFn(startReceiptParsing)

  const [selectedUserId, setSelectedUserId] = React.useState("")
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null)
  const [uploadedObjectKey, setUploadedObjectKey] = React.useState<
    string | null
  >(null)
  const [selectedFileName, setSelectedFileName] = React.useState("")
  const [errorState, setErrorState] = React.useState<CaptureErrorState | null>(
    null
  )

  const bootstrapQuery = useQuery({
    queryKey: ["scan-bootstrap"],
    queryFn: () => bootstrapServerFn(),
  })

  React.useEffect(() => {
    if (!previewUrl) {
      return
    }

    return () => {
      URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  React.useEffect(() => {
    const users = bootstrapQuery.data?.users ?? []

    if (!users.length) {
      return
    }

    setSelectedUserId((currentValue) => {
      if (users.some((user) => user.id === currentValue)) {
        return currentValue
      }

      const storedUserId = window.localStorage.getItem(lastUserStorageKey)

      if (storedUserId && users.some((user) => user.id === storedUserId)) {
        return storedUserId
      }

      return users[0]?.id ?? ""
    })
  }, [bootstrapQuery.data?.users])

  React.useEffect(() => {
    if (!selectedUserId) {
      return
    }

    window.localStorage.setItem(lastUserStorageKey, selectedUserId)
  }, [selectedUserId])

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!selectedUserId) {
        throw new Error("Selecione um funcionário antes de enviar um recibo.")
      }

      const contentType = file.type || "image/jpeg"
      const upload = await createUploadUrlServerFn({
        data: {
          contentType,
          fileName: file.name,
          userId: selectedUserId,
        },
      })

      const response = await fetch(upload.uploadUrl, {
        body: file,
        headers: {
          "Content-Type": upload.contentType,
        },
        method: "PUT",
      })

      if (!response.ok) {
        throw new Error("Não foi possível enviar a foto. Tente outra imagem.")
      }

      return upload
    },
    onSuccess: (result) => {
      setUploadedObjectKey(result.objectKey)
      setErrorState(null)
    },
    onError: (error) => {
      setErrorState({
        message:
          error instanceof TypeError && /Failed to fetch/i.test(error.message)
            ? t("scan.uploadCorsFallback")
            : toErrorMessage(error, t("scan.uploadErrorFallback")),
      })
    },
  })

  const startParsingMutation = useMutation({
    mutationFn: async () => {
      if (!selectedUserId) {
        throw new Error("Selecione um funcionário antes de extrair o recibo.")
      }

      if (!uploadedObjectKey) {
        throw new Error("Envie a imagem do recibo antes de iniciar a extração.")
      }

      return startReceiptParsingServerFn({
        data: {
          objectKey: uploadedObjectKey,
          userId: selectedUserId,
        },
      })
    },
    onSuccess: async (result) => {
      await navigate({
        params: {
          receiptId: result.receiptId,
        },
        to: "/scan/processando/$receiptId",
      })
    },
    onError: (error) => {
      setErrorState({
        message: toErrorMessage(error, t("scan.errorFallback")),
      })
    },
  })

  const users = bootstrapQuery.data?.users ?? []
  const isAnalyzeDisabled =
    !uploadedObjectKey ||
    uploadMutation.isPending ||
    startParsingMutation.isPending

  function resetSelection() {
    setErrorState(null)
    setPreviewUrl(null)
    setSelectedFileName("")
    setUploadedObjectKey(null)
  }

  function openFilePicker() {
    fileInputRef.current?.click()
  }

  async function handleFileSelection(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const nextFile = event.target.files?.[0]

    if (!nextFile) {
      return
    }

    resetSelection()
    setPreviewUrl(URL.createObjectURL(nextFile))
    setSelectedFileName(nextFile.name)
    uploadMutation.mutate(nextFile)
    event.target.value = ""
  }

  function handleAnalyze() {
    setErrorState(null)
    startParsingMutation.mutate()
  }

  if (bootstrapQuery.isPending) {
    return (
      <div className="flex min-h-[calc(100vh-120px)] items-center justify-center p-6">
        <div className="flex items-center gap-3 text-sm text-text-secondary">
          <Loader2 className="animate-spin" size={18} />
          {t("scan.loading")}
        </div>
      </div>
    )
  }

  if (bootstrapQuery.isError) {
    return (
      <div className="mx-auto flex min-h-[calc(100vh-120px)] max-w-md flex-col justify-center gap-4 p-6">
        <Card className="p-6">
          <div className="flex items-start gap-3">
            <TriangleAlert className="mt-1 text-danger" size={20} />
            <div className="space-y-2">
              <h1 className="font-display text-xl font-bold">
                {t("scan.unavailableTitle")}
              </h1>
              <p className="text-sm text-text-secondary">
                {toErrorMessage(
                  bootstrapQuery.error,
                  t("scan.unavailableFallback")
                )}
              </p>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-120px)] max-w-md flex-col p-4">
      <input
        ref={fileInputRef}
        accept={SUPPORTED_RECEIPT_MIME_TYPES.join(",")}
        capture="environment"
        className="hidden"
        onChange={handleFileSelection}
        type="file"
      />

      <div className="mb-4 flex items-center gap-3 rounded-[24px] border border-border/60 bg-bg-surface px-4 py-3 shadow-soft">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-bg-base">
          <UserRound size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <label className="block text-xs font-medium tracking-[0.12em] text-text-secondary uppercase">
            {t("scan.employee")}
          </label>
          <select
            className="mt-1 w-full bg-transparent text-sm font-medium outline-none"
            disabled={!users.length}
            onChange={(event) => setSelectedUserId(event.target.value)}
            value={selectedUserId}
          >
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.fullName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!users.length ? (
        <Card className="p-6">
          <p className="text-sm text-text-secondary">{t("scan.noEmployees")}</p>
        </Card>
      ) : (
        <AnimatePresence mode="wait">
          {!previewUrl ? (
            <motion.div
              key="capture"
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-1 flex-col justify-center gap-6"
              initial={{ opacity: 0, y: 18 }}
            >
              <div className="space-y-2 text-center">
                <h1 className="font-display text-4xl font-bold tracking-tight">
                  {t("scan.captureTitle")}
                </h1>
                <p className="text-base text-text-secondary">
                  {t("scan.captureDescription")}
                </p>
              </div>

              <button
                className="group relative flex aspect-[3/4] w-full flex-col items-center justify-center gap-4 overflow-hidden rounded-[32px] border border-border/50 bg-bg-surface shadow-floating transition-transform hover:scale-[1.01]"
                onClick={openFilePicker}
                type="button"
              >
                <div className="absolute inset-4 rounded-[24px] border-2 border-dashed border-border transition-colors group-hover:border-accent/30" />
                <div className="flex h-18 w-18 items-center justify-center rounded-full bg-bg-base">
                  <Camera size={30} />
                </div>
                <div className="space-y-1 text-center">
                  <p className="font-display text-xl font-bold">
                    {t("scan.captureButton")}
                  </p>
                  <p className="max-w-2xs text-sm text-text-secondary">
                    {t("scan.captureHint")}
                  </p>
                </div>
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="preview"
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-1 flex-col gap-5"
              initial={{ opacity: 0, y: 16 }}
              exit={{ opacity: 0, y: -16 }}
            >
              <div className="space-y-1 text-center">
                <h2 className="font-display text-3xl font-bold">
                  {t("scan.confirmPhotoTitle")}
                </h2>
                <p className="text-sm text-text-secondary">
                  {uploadMutation.isPending
                    ? t("scan.confirmPhotoUploading")
                    : t("scan.confirmPhotoReady")}
                </p>
              </div>

              <Card className="overflow-hidden">
                <img
                  alt="Pré-visualização do recibo"
                  className="aspect-[3/4] w-full bg-bg-base object-contain"
                  src={previewUrl}
                />
              </Card>

              <div className="rounded-[24px] border border-border/60 bg-bg-surface px-4 py-3 text-sm text-text-secondary shadow-soft">
                <p className="truncate font-medium text-text-primary">
                  {selectedFileName}
                </p>
                <p className="mt-1">
                  {uploadMutation.isPending
                    ? t("scan.uploadingNow")
                    : uploadedObjectKey
                      ? t("scan.storedAndReady")
                      : t("scan.waitingUpload")}
                </p>
              </div>

              {errorState ? (
                <Card className="p-5">
                  <div className="flex items-start gap-3">
                    <TriangleAlert className="mt-1 text-danger" size={18} />
                    <p className="text-sm text-text-secondary">
                      {errorState.message}
                    </p>
                  </div>
                </Card>
              ) : null}

              <div className="mt-auto flex gap-3">
                <Button
                  className="flex-1"
                  onClick={openFilePicker}
                  type="button"
                  variant="secondary"
                >
                  <ImagePlus className="mr-2" size={18} />
                  {t("scan.chooseAnother")}
                </Button>
                <Button
                  className="flex-1"
                  disabled={isAnalyzeDisabled}
                  onClick={handleAnalyze}
                  type="button"
                >
                  {uploadMutation.isPending ||
                  startParsingMutation.isPending ? (
                    <Loader2 className="mr-2 animate-spin" size={18} />
                  ) : (
                    <Sparkles className="mr-2" size={18} />
                  )}
                  {t("scan.analyze")}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  )
}
