import { describe, expect, test } from "bun:test"

import { karmartFilePath, readKarmartFile } from "./karmart-files"

describe("karmartFilePath", () => {
  test("finds the receipt logo", () => {
    expect(karmartFilePath("logo.jpeg")).toContain("logo.jpeg")
    expect(readKarmartFile("logo.jpeg").byteLength).toBeGreaterThan(1000)
  })
})
