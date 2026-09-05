import { existsSync, readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const NAMES = [
  "logo.jpeg",
  "AngsanaUPC-Regular-cmap.ttf",
  "AngsanaUPC-Bold-cmap.ttf",
] as const

export type KarmartFileName = (typeof NAMES)[number]

function karmartDirCandidates(): string[] {
  const here = dirname(fileURLToPath(import.meta.url))
  return [
    join(process.cwd(), "src/assets/karmart"),
    join(process.cwd(), "assets/karmart"),
    join(here, "../../assets/karmart"),
  ]
}

export function karmartFilePath(name: KarmartFileName): string {
  for (const dir of karmartDirCandidates()) {
    const path = join(dir, name)
    if (existsSync(path)) {
      return path
    }
  }
  throw new Error(`Receipt file missing: ${name}`)
}

export function readKarmartFile(name: KarmartFileName): Buffer {
  return readFileSync(karmartFilePath(name))
}

export const KARMART_RUNTIME_FILES: readonly KarmartFileName[] = NAMES
