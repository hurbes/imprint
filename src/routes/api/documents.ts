import { createFileRoute } from "@tanstack/react-router"

import { getAppDocumentStore } from "@/lib/pdf/document-store"
import { parseDocumentDraft } from "@/lib/pdf/parse-pdf-request"
import { isPdfFailure } from "@/lib/pdf/types"

export const Route = createFileRoute("/api/documents")({
  server: {
    handlers: {
      GET: () => {
        return Response.json(getAppDocumentStore().list())
      },
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
        const parsed = parseDocumentDraft(body)
        if (isPdfFailure(parsed)) {
          return Response.json(parsed, { status: 400 })
        }
        const document = getAppDocumentStore().create(parsed)
        return Response.json(document, { status: 201 })
      },
    },
  },
})
