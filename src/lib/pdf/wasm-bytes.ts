import { existsSync, readFileSync } from "node:fs"
import { createRequire } from "node:module"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

function wasmCandidates(packageExport: string, filename: string): string[] {
  const candidates: string[] = []
  try {
    candidates.push(createRequire(import.meta.url).resolve(packageExport))
  } catch {
    // Bundled output does not keep the package export map.
  }
  const here = dirname(fileURLToPath(import.meta.url))
  candidates.push(
    join(here, filename),
    join(here, "_libs", filename),
    join(process.cwd(), filename),
    join(process.cwd(), "_libs", filename),
  )
  return candidates
}

export function readWasmBytes(
  packageExport: string,
  filename: string,
): Buffer {
  for (const path of wasmCandidates(packageExport, filename)) {
    if (existsSync(path)) {
      return readFileSync(path)
    }
  }
  throw new Error(`PDF engine file missing: ${filename}`)
}
