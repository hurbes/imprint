import { createElement } from "react"
import { renderDocument } from "@formepdf/core"
import { PdfRenderer, type RenderOptions } from "takumi-pdf"

import {
  isKarmartReceipt,
  karmartReceiptMarkup,
  karmartRenderOptions,
} from "./karmart-receipt"
import { templateDocument } from "./templates"
import type { PdfFailure, PdfOutcome, PdfRequest } from "./types"

const unknownTemplate = (name: string): PdfFailure => ({
  kind: "unknown-template",
  message: `Unknown template: ${name}`,
  name,
})

function fail(error: PdfFailure): PdfOutcome {
  return { ok: false, error }
}

function ok(bytes: Uint8Array, filename: string): PdfOutcome {
  return { ok: true, value: { bytes, filename } }
}

function pdfFilename(request: PdfRequest): string {
  return request.filename ?? "document.pdf"
}

async function renderTakumi(
  node: Parameters<PdfRenderer["render"]>[0],
  options?: RenderOptions,
): Promise<Uint8Array> {
  const renderer = new PdfRenderer()
  try {
    return await renderer.render(node, options)
  } finally {
    renderer.free()
  }
}

export async function createPdf(request: PdfRequest): Promise<PdfOutcome> {
  try {
    if (
      request.design.kind === "template" &&
      request.design.name === "receipt-karmart" &&
      request.engine === "takumi"
    ) {
      const markup = await karmartReceiptMarkup(request.data)
      const bytes = await renderTakumi(markup, await karmartRenderOptions())
      return ok(bytes, pdfFilename(request))
    }
    if (request.engine === "forme") {
      const Document = templateDocument("forme", request.design.name)
      if (!Document) {
        return fail(unknownTemplate(request.design.name))
      }
      const bytes = await renderDocument(
        createElement(Document, { data: request.data }),
      )
      return ok(bytes, pdfFilename(request))
    }
    if (request.design.kind === "html") {
      const options = isKarmartReceipt(request.design.markup)
        ? await karmartRenderOptions()
        : undefined
      const bytes = await renderTakumi(request.design.markup, options)
      return ok(bytes, pdfFilename(request))
    }
    if (request.design.kind === "tree") {
      const bytes = await renderTakumi(request.design.node as never)
      return ok(bytes, pdfFilename(request))
    }
    const Document = templateDocument("takumi", request.design.name)
    if (!Document) {
      return fail(unknownTemplate(request.design.name))
    }
    const bytes = await renderTakumi(
      createElement(Document, { data: request.data }),
    )
    return ok(bytes, pdfFilename(request))
  } catch (error) {
    const message = error instanceof Error ? error.message : "Render failed"
    return fail({ kind: "render-failed", message })
  }
}
