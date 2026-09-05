import { describe, expect, test } from "bun:test"

import { invoiceMinimalFixture } from "./invoice-minimal-fixture"
import { karmartReceiptFixture } from "./karmart-receipt-fixture"
import { parsePdfRequest } from "./parse-pdf-request"
import { isPdfFailure } from "./types"

describe("parsePdfRequest", () => {
  test("missing design is invalid-request", () => {
    const result = parsePdfRequest({
      engine: "takumi",
      data: invoiceMinimalFixture,
    })
    expect(isPdfFailure(result)).toBe(true)
    if (isPdfFailure(result)) {
      expect(result.kind).toBe("invalid-request")
    }
  })

  test("missing engine is invalid-request", () => {
    const result = parsePdfRequest({
      design: { kind: "template", name: "invoice-minimal" },
      data: invoiceMinimalFixture,
    })
    expect(isPdfFailure(result)).toBe(true)
    if (isPdfFailure(result)) {
      expect(result.kind).toBe("invalid-request")
    }
  })

  test("forme html is invalid-request", () => {
    const result = parsePdfRequest({
      engine: "forme",
      design: { kind: "html", markup: "<div>Hello</div>" },
      data: {},
    })
    expect(isPdfFailure(result)).toBe(true)
    if (isPdfFailure(result)) {
      expect(result.kind).toBe("invalid-request")
    }
  })

  test("parses takumi invoice-minimal with fixture data", () => {
    const result = parsePdfRequest({
      engine: "takumi",
      design: { kind: "template", name: "invoice-minimal" },
      data: invoiceMinimalFixture,
    })
    expect(isPdfFailure(result)).toBe(false)
    if (!isPdfFailure(result)) {
      expect(result.engine).toBe("takumi")
      expect(result.design).toEqual({
        kind: "template",
        name: "invoice-minimal",
      })
      expect(result.data.invoiceNumber).toBe("INV-2026-003")
    }
  })

  test("parses takumi receipt-karmart with fixture data", () => {
    const result = parsePdfRequest({
      engine: "takumi",
      design: { kind: "template", name: "receipt-karmart" },
      data: karmartReceiptFixture,
    })
    expect(isPdfFailure(result)).toBe(false)
    if (!isPdfFailure(result)) {
      expect(result.design).toEqual({
        kind: "template",
        name: "receipt-karmart",
      })
      expect(result.data.documentNo).toBe("C16IP69080880")
    }
  })

  test("parses forme invoice-minimal with fixture data", () => {
    const result = parsePdfRequest({
      engine: "forme",
      design: { kind: "template", name: "invoice-minimal" },
      data: invoiceMinimalFixture,
    })
    expect(isPdfFailure(result)).toBe(false)
    if (!isPdfFailure(result)) {
      expect(result.engine).toBe("forme")
      expect(result.design).toEqual({
        kind: "template",
        name: "invoice-minimal",
      })
    }
  })
})
