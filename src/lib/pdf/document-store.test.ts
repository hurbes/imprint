import { describe, expect, test } from "bun:test"
import { mkdtempSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

import { createDocumentStore } from "./document-store"
import { invoiceMinimalFixture } from "./invoice-minimal-fixture"

const design = {
  kind: "template" as const,
  name: "invoice-minimal" as const,
}

function tempStore() {
  const dir = mkdtempSync(join(tmpdir(), "pdf-maker-"))
  return createDocumentStore(join(dir, "docs.sqlite"))
}

describe("DocumentStore", () => {
  test("create then get returns the same record", () => {
    const store = tempStore()
    const created = store.create({
      title: "Acme invoice",
      engine: "takumi",
      design,
      data: { ...invoiceMinimalFixture },
    })
    const loaded = store.get(created.id)
    expect(loaded).not.toBeNull()
    expect(loaded?.title).toBe("Acme invoice")
    expect(loaded?.engine).toBe("takumi")
    expect(loaded?.design).toEqual(design)
    expect(loaded?.data.invoiceNumber).toBe("INV-2026-003")
  })

  test("list includes the saved title", () => {
    const store = tempStore()
    store.create({
      title: "Listed invoice",
      engine: "forme",
      design,
      data: { ...invoiceMinimalFixture },
    })
    const titles = store.list().map((row) => row.title)
    expect(titles).toContain("Listed invoice")
  })

  test("update persists data", () => {
    const store = tempStore()
    const created = store.create({
      title: "Draft",
      engine: "takumi",
      design,
      data: { ...invoiceMinimalFixture },
    })
    const updated = store.update(created.id, {
      data: { ...invoiceMinimalFixture, invoiceNumber: "INV-999" },
    })
    expect(updated?.data.invoiceNumber).toBe("INV-999")
    expect(store.get(created.id)?.data.invoiceNumber).toBe("INV-999")
  })

  test("get missing id returns null", () => {
    const store = tempStore()
    expect(store.get("missing-id")).toBeNull()
  })
})
