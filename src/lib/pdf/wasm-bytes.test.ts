import { describe, expect, test } from "bun:test"
import { existsSync } from "node:fs"

import { readWasmBytes } from "./wasm-bytes"

describe("readWasmBytes", () => {
  test("loads Takumi WASM from the installed package", () => {
    const bytes = readWasmBytes(
      "takumi-pdf/takumi_pdf_wasm_bg.wasm",
      "takumi_pdf_wasm_bg.wasm",
    )
    expect(bytes.byteLength).toBeGreaterThan(1_000_000)
  })

  test("loads Forme WASM from the installed package", () => {
    const bytes = readWasmBytes(
      "@formepdf/core/pkg-web/forme_bg.wasm",
      "forme_bg.wasm",
    )
    expect(bytes.byteLength).toBeGreaterThan(1_000_000)
  })

  test("fails with a clear message when the file is absent", () => {
    expect(() =>
      readWasmBytes("not-a-real-package/missing.wasm", "missing.wasm"),
    ).toThrow("PDF engine file missing: missing.wasm")
    expect(existsSync("missing.wasm")).toBe(false)
  })
})
