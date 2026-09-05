import { createFileRoute } from "@tanstack/react-router"

import { getAppDocumentStore } from "@/lib/pdf/document-store"
import { parsePdfRequest } from "@/lib/pdf/parse-pdf-request"
import { isPdfFailure } from "@/lib/pdf/types"

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

export const Route = createFileRoute("/api/documents/$id")({
  server: {
    handlers: {
      GET: ({ params }) => {
        const document = getAppDocumentStore().get(params.id)
        if (!document) {
          return Response.json(
            { kind: "invalid-request", message: "Document not found" },
            { status: 404 },
          )
        }
        return Response.json(document)
      },
      PATCH: async ({ params, request }) => {
        const store = getAppDocumentStore()
        const current = store.get(params.id)
        if (!current) {
          return Response.json(
            { kind: "invalid-request", message: "Document not found" },
            { status: 404 },
          )
        }
        let body: unknown
        try {
          body = await request.json()
        } catch {
          return Response.json(
            { kind: "invalid-request", message: "Body must be JSON" },
            { status: 400 },
          )
        }
        if (!isRecord(body)) {
          return Response.json(
            { kind: "invalid-request", message: "Body must be an object" },
            { status: 400 },
          )
        }
        const title =
          typeof body.title === "string" ? body.title.trim() : current.title
        if (title === "") {
          return Response.json(
            { kind: "invalid-request", message: "title must be a non-empty string" },
            { status: 400 },
          )
        }
        const parsed = parsePdfRequest({
          engine: body.engine ?? current.engine,
          design: body.design ?? current.design,
          data: body.data ?? current.data,
        })
        if (isPdfFailure(parsed)) {
          return Response.json(parsed, { status: 400 })
        }
        const updated = store.update(params.id, {
          title,
          engine: parsed.engine,
          design: parsed.design,
          data: parsed.data,
        })
        return Response.json(updated)
      },
      DELETE: ({ params }) => {
        const removed = getAppDocumentStore().remove(params.id)
        if (!removed) {
          return Response.json(
            { kind: "invalid-request", message: "Document not found" },
            { status: 404 },
          )
        }
        return new Response(null, { status: 204 })
      },
    },
  },
})
