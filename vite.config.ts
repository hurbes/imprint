import { copyFileSync, existsSync, mkdirSync } from "node:fs"
import { join } from "node:path"
import { defineConfig, type Plugin } from "vite"
import { devtools } from "@tanstack/devtools-vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import { nitro } from "nitro/vite"
import viteReact from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

import { KARMART_RUNTIME_FILES } from "./src/lib/pdf/karmart-files.ts"

function copyPdfRuntimeFiles(): Plugin {
  return {
    name: "copy-pdf-runtime-files",
    apply: "build",
    closeBundle() {
      const wasmDestinations = [
        join(process.cwd(), ".output/server"),
        join(process.cwd(), ".output/server/_libs"),
        join(process.cwd(), ".vercel/output/functions/__server.func"),
        join(
          process.cwd(),
          ".vercel/output/functions/__server.func/_libs",
        ),
      ]
      const wasmFiles = [
        {
          from: join(
            process.cwd(),
            "node_modules/@formepdf/core/pkg-web/forme_bg.wasm",
          ),
          name: "forme_bg.wasm",
        },
        {
          from: join(
            process.cwd(),
            "node_modules/takumi-pdf/pkg/takumi_pdf_wasm_bg.wasm",
          ),
          name: "takumi_pdf_wasm_bg.wasm",
        },
      ]
      for (const destDir of wasmDestinations) {
        if (!existsSync(join(destDir, ".."))) {
          continue
        }
        mkdirSync(destDir, { recursive: true })
        for (const file of wasmFiles) {
          copyFileSync(file.from, join(destDir, file.name))
        }
      }

      const karmartDestinations = [
        join(process.cwd(), ".output/server/src/assets/karmart"),
        join(
          process.cwd(),
          ".vercel/output/functions/__server.func/src/assets/karmart",
        ),
      ]
      const karmartFiles = KARMART_RUNTIME_FILES
      for (const destDir of karmartDestinations) {
        if (!existsSync(join(destDir, "../../.."))) {
          continue
        }
        mkdirSync(destDir, { recursive: true })
        for (const name of karmartFiles) {
          copyFileSync(
            join(process.cwd(), "src/assets/karmart", name),
            join(destDir, name),
          )
        }
      }
    },
  }
}

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  ssr: {
    external: ["bun:sqlite", "takumi-pdf", "@formepdf/core", "@formepdf/react"],
  },
  plugins: [
    devtools(),
    tailwindcss(),
    tanstackStart(),
    nitro({
      wasm: false,
      traceDeps: ["takumi-pdf*", "@formepdf/core*"],
    }),
    viteReact(),
    copyPdfRuntimeFiles(),
  ],
})

export default config
