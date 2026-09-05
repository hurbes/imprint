import { createFileRoute } from "@tanstack/react-router"

import { createPdf } from "@/lib/pdf/create-pdf"
import { parsePdfRequest } from "@/lib/pdf/parse-pdf-request"
import { isPdfFailure } from "@/lib/pdf/types"

export const Route = createFileRoute("/api/pdf")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: unknown
        try {
          body = await request.json()
        } catch {
          return Response.json(
            { kind: "invalid-request", message: "Body must be JSON" },
            { status: 400 },
          )
        }
        const parsed = parsePdfRequest(body)
        if (isPdfFailure(parsed)) {
          return Response.json(parsed, { status: 400 })
        }
        const outcome = await createPdf(parsed)
        if (!outcome.ok) {
          const status =
            outcome.error.kind === "render-failed" ? 500 : 400
          return Response.json(outcome.error, { status })
        }
        return new Response(Buffer.from(outcome.value.bytes), {
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="${outcome.value.filename}"`,
          },
        })
      },
    },
  },
})
