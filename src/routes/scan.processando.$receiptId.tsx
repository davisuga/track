import * as React from "react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { useTranslation } from "react-i18next"
import { Loader2, Plus, TriangleAlert, Upload } from "lucide-react"
import { motion } from "motion/react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { streamReceiptParsingStatus } from "@/features/scan/server"
import { toErrorMessage } from "@/features/scan/utils"

type ProcessingState = "processing" | "flagged" | "error"

export const Route = createFileRoute("/scan/processando/$receiptId")({
  component: ScanProcessingRoute,
})

function ScanProcessingRoute() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { receiptId } = Route.useParams()
  const streamReceiptParsingStatusServerFn = useServerFn(
    streamReceiptParsingStatus
  )
  const [state, setState] = React.useState<ProcessingState>("processing")
  const [errorMessage, setErrorMessage] = React.useState("")

  React.useEffect(() => {
    const abortController = new AbortController()
    const textDecoder = new TextDecoder()
    let buffer = ""
    let cancelled = false

    async function watchReceipt() {
      const response = await streamReceiptParsingStatusServerFn({
        data: receiptId,
        signal: abortController.signal,
      })

      if (!(response instanceof Response) || !response.body) {
        throw new Error(
          "Não foi possível acompanhar o processamento do recibo em tempo real."
        )
      }

      const reader = response.body.getReader()

      while (!cancelled) {
        const { done, value } = await reader.read()

        if (done) {
          break
        }

        buffer += textDecoder.decode(value, { stream: true })

        while (buffer.includes("\n")) {
          const lineBreakIndex = buffer.indexOf("\n")
          const line = buffer.slice(0, lineBreakIndex).trim()
          buffer = buffer.slice(lineBreakIndex + 1)

          if (!line) {
            continue
          }

          const event = JSON.parse(line) as {
            draft: unknown
            receiptId: string
            status: string
          }

          if (event.status === "extracted") {
            await navigate({
              params: {
                receiptId: event.receiptId,
              },
              replace: true,
              to: "/scan/revisar/$receiptId",
            })
            return
          }

          if (event.status === "flagged") {
            setState("flagged")
            return
          }
        }
      }
    }

    void watchReceipt().catch((error) => {
      if (abortController.signal.aborted || cancelled) {
        return
      }

      setErrorMessage(toErrorMessage(error, t("scan.errorFallback")))
      setState("error")
    })

    return () => {
      cancelled = true
      abortController.abort()
    }
  }, [navigate, receiptId, streamReceiptParsingStatusServerFn, t])

  if (state === "processing") {
    return (
      <motion.div
        animate={{ opacity: 1, scale: 1 }}
        className="flex min-h-[calc(100vh-120px)] flex-col items-center justify-center gap-6 p-6"
        initial={{ opacity: 0, scale: 0.95 }}
      >
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-bg-surface shadow-floating">
          <Loader2 className="animate-spin text-accent" size={30} />
        </div>
        <div className="space-y-2 text-center">
          <h2 className="font-display text-2xl font-bold">
            {t("scan.analyzingTitle")}
          </h2>
          <p className="text-sm text-text-secondary">
            {t("scan.analyzingDescription")}
          </p>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-120px)] max-w-md flex-col justify-center gap-5 p-6">
      <Card className="p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-danger/10 text-danger">
            <TriangleAlert size={22} />
          </div>
          <div className="space-y-2">
            <h2 className="font-display text-2xl font-bold">
              {t("scan.errorTitle")}
            </h2>
            <p className="text-sm text-text-secondary">
              {state === "flagged" ? t("scan.errorFallback") : errorMessage}
            </p>
          </div>
        </div>
      </Card>

      <div className="flex flex-col gap-3">
        <Button
          onClick={() =>
            navigate({
              params: {
                receiptId,
              },
              to: "/scan/revisar/$receiptId",
            })
          }
          type="button"
        >
          <Plus className="mr-2" size={18} />
          {t("scan.enterManually")}
        </Button>
        <Button
          onClick={() =>
            navigate({
              to: "/scan",
            })
          }
          type="button"
          variant="secondary"
        >
          <Upload className="mr-2" size={18} />
          {t("scan.tryAnotherPhoto")}
        </Button>
      </div>
    </div>
  )
}
