import { describe, expect, test } from "bun:test"

import { createPdf } from "./create-pdf"
import { invoiceMinimalFixture } from "./invoice-minimal-fixture"
import { karmartReceiptFixture } from "./karmart-receipt-fixture"
import type { PdfRequest, TemplateName } from "./types"

describe("createPdf", () => {
  test("unknown template is unknown-template", async () => {
    const request = {
      engine: "takumi",
      design: { kind: "template", name: "not-a-template" as TemplateName },
      data: {},
    } satisfies PdfRequest
    const outcome = await createPdf(request)
    expect(outcome.ok).toBe(false)
    if (!outcome.ok) {
      expect(outcome.error.kind).toBe("unknown-template")
    }
  })

  test("takumi invoice-minimal yields a PDF", async () => {
    const outcome = await createPdf({
      engine: "takumi",
      design: { kind: "template", name: "invoice-minimal" },
      data: invoiceMinimalFixture,
    })
    expect(outcome.ok).toBe(true)
    if (outcome.ok) {
      expect(startsWithPdf(outcome.value.bytes)).toBe(true)
    }
  })

  test("forme invoice-minimal yields a PDF", async () => {
    const outcome = await createPdf({
      engine: "forme",
      design: { kind: "template", name: "invoice-minimal" },
      data: invoiceMinimalFixture,
    })
    expect(outcome.ok).toBe(true)
    if (outcome.ok) {
      expect(startsWithPdf(outcome.value.bytes)).toBe(true)
    }
  })

  test("takumi receipt-karmart yields a PDF", async () => {
    const outcome = await createPdf({
      engine: "takumi",
      design: { kind: "template", name: "receipt-karmart" },
      data: karmartReceiptFixture,
    })
    expect(outcome.ok).toBe(true)
    if (outcome.ok) {
      expect(startsWithPdf(outcome.value.bytes)).toBe(true)
    }
  })

  test("takumi receipt-karmart keeps English, Thai, and digits in Angsana", async () => {
    const alphabet =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789 " +
      "กขฃคฅฆงจฉชซฌญฎฏฐฑฒณดตถทธนบปผฝพฟภมยรฤลฦวศษสหฬอฮฯะาำิีึืุูเแโใไ่้๊๋์ํ฿๐๑๒๓๔๕๖๗๘๙"
    const outcome = await createPdf({
      engine: "takumi",
      design: { kind: "template", name: "receipt-karmart" },
      data: {
        ...karmartReceiptFixture,
        buyerAddress: [alphabet, alphabet],
      },
    })
    expect(outcome.ok).toBe(true)
    if (outcome.ok) {
      const pdf = Buffer.from(outcome.value.bytes).toString("latin1")
      expect(pdf.includes("Tahoma")).toBe(false)
      expect(pdf.includes("Geist")).toBe(false)
      expect(pdf.includes("AngsanaUPC")).toBe(true)
    }
  })

  test("takumi receipt-karmart draws Harsh in Angsana, not a fallback face", async () => {
    const outcome = await createPdf({
      engine: "takumi",
      design: { kind: "template", name: "receipt-karmart" },
      data: {
        ...karmartReceiptFixture,
        buyerAddress: ["Name Harsh Bansal", karmartReceiptFixture.buyerAddress[1]],
      },
    })
    expect(outcome.ok).toBe(true)
    if (outcome.ok) {
      const pdf = Buffer.from(outcome.value.bytes).toString("latin1")
      expect(pdf.includes("Tahoma")).toBe(false)
      expect(pdf.includes("Geist")).toBe(false)
      expect(pdf.includes("AngsanaUPC")).toBe(true)
    }
  })

  test("takumi receipt-karmart clips extra items without failing", async () => {
    const outcome = await createPdf({
      engine: "takumi",
      design: { kind: "template", name: "receipt-karmart" },
      data: {
        ...karmartReceiptFixture,
        buyerName: `${karmartReceiptFixture.buyerName} `.repeat(20),
        items: [
          ...karmartReceiptFixture.items,
          ...Array.from({ length: 30 }, (_, index) => ({
            productCode: `EXTRA${String(index).padStart(8, "0")}`,
            description: "Extra line that must not shove totals",
            quantity: 1,
            unitPrice: 1,
            amount: 1,
          })),
        ],
      },
    })
    expect(outcome.ok).toBe(true)
    if (outcome.ok) {
      expect(startsWithPdf(outcome.value.bytes)).toBe(true)
    }
  })

  test("forme receipt-karmart yields a PDF", async () => {
    const outcome = await createPdf({
      engine: "forme",
      design: { kind: "template", name: "receipt-karmart" },
      data: karmartReceiptFixture,
    })
    expect(outcome.ok).toBe(true)
    if (outcome.ok) {
      expect(startsWithPdf(outcome.value.bytes)).toBe(true)
    }
  })

  test("takumi html yields a PDF", async () => {
    const outcome = await createPdf({
      engine: "takumi",
      design: { kind: "html", markup: "<div>Hello</div>" },
      data: {},
    })
    expect(outcome.ok).toBe(true)
    if (outcome.ok) {
      expect(startsWithPdf(outcome.value.bytes)).toBe(true)
    }
  })
})

function startsWithPdf(bytes: Uint8Array): boolean {
  return (
    bytes.length >= 4 &&
    bytes[0] === 0x25 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x44 &&
    bytes[3] === 0x46
  )
}
