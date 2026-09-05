import { readFile } from "node:fs/promises"
import { join } from "node:path"

import type { FontLoader, RenderOptions } from "takumi-pdf"

import drawings from "../../assets/karmart/drawings.json"
import {
  KARMART_PX,
  PAGE_HEIGHT_PT,
  PAGE_WIDTH_PT,
  buyerAddressText,
  companyTaxLine,
  formatKarmartMoney,
  itemColumns,
  itemSlot,
  karmartLabels,
  karmartSafeText,
  karmartValueSlots,
  normalizeKarmartData,
  visibleKarmartItems,
  type KarmartSlot,
} from "./karmart-receipt-slots"

export const KARMART_RECEIPT_MARK = 'data-doc="karmart-receipt"'

type DrawingItem = {
  t: string
  a: number[]
}

type Drawing = {
  type: string
  color: number[] | null
  fill: number[] | null
  width: number | null
  items: DrawingItem[]
}

function n(value: number): string {
  return value.toFixed(3).replace(/\.?0+$/, "")
}

function px(pt: number): string {
  return `${n(pt * KARMART_PX)}px`
}

function rgb(channels: number[]): string {
  const [r = 0, g = 0, b = 0] = channels
  const hex = (c: number) =>
    Math.round(c * 255)
      .toString(16)
      .padStart(2, "0")
  return `#${hex(r)}${hex(g)}${hex(b)}`
}

function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
}

function pathFromItems(items: DrawingItem[]): string {
  return items
    .map((item) => {
      const a = item.a
      if (item.t === "l") {
        return `M${n(a[0] ?? 0)} ${n(a[1] ?? 0)}L${n(a[2] ?? 0)} ${n(a[3] ?? 0)}`
      }
      if (item.t === "c") {
        return `M${n(a[0] ?? 0)} ${n(a[1] ?? 0)}C${n(a[2] ?? 0)} ${n(a[3] ?? 0)} ${n(a[4] ?? 0)} ${n(a[5] ?? 0)} ${n(a[6] ?? 0)} ${n(a[7] ?? 0)}`
      }
      if (item.t === "re") {
        const x0 = a[0] ?? 0
        const y0 = a[1] ?? 0
        const x1 = a[2] ?? 0
        const y1 = a[3] ?? 0
        return `M${n(x0)} ${n(y0)}H${n(x1)}V${n(y1)}H${n(x0)}Z`
      }
      return ""
    })
    .join("")
}

function drawingSvg(drawing: Drawing): string {
  const d = pathFromItems(drawing.items)
  if (!d) {
    return ""
  }
  if (drawing.type === "f" && drawing.fill) {
    return `<path d="${d}" fill="${rgb(drawing.fill)}" stroke="none"/>`
  }
  const stroke = drawing.color ? rgb(drawing.color) : "#000"
  const width = drawing.width ?? 0.5
  return `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${n(width)}" stroke-linecap="butt" stroke-linejoin="miter"/>`
}

function slotFamily(slot: KarmartSlot): string {
  return slot.font === "AngsanaUPCBold" ? "AngsanaUPCBold" : "AngsanaUPC"
}

function slotBox(slot: KarmartSlot, text: string): string {
  if (text === "") {
    return ""
  }
  const wrap = slot.wrap ? "pre-wrap" : "nowrap"
  const align = slot.align ?? "left"
  const leading = slot.wrap ? px(slot.size + 2.5) : px(slot.height)
  return `<div style="position:absolute;left:${px(slot.left)};top:${px(slot.top)};width:${px(slot.width)};height:${px(slot.height)};overflow:hidden;font-family:${slotFamily(slot)};font-size:${px(slot.size)};font-weight:400;line-height:${leading};white-space:${wrap};text-align:${align};color:#000">${escapeHtml(karmartSafeText(text))}</div>`
}

export function isKarmartReceipt(markup: string): boolean {
  return markup.includes(KARMART_RECEIPT_MARK)
}

export async function karmartReceiptMarkup(
  data: Record<string, unknown> = {},
): Promise<string> {
  const receipt = normalizeKarmartData(data)
  const logo = (await readFile(asset("logo.jpeg"))).toString("base64")
  const paths = (drawings as Drawing[]).map(drawingSvg).join("")
  const labels = karmartLabels.map((label) => slotBox(label.slot, label.text))
  const values = [
    slotBox(karmartValueSlots.page, receipt.page),
    slotBox(karmartValueSlots.title, receipt.title),
    slotBox(karmartValueSlots.companyName, receipt.companyName),
    slotBox(karmartValueSlots.companyAddress, receipt.companyAddress),
    slotBox(karmartValueSlots.companyTaxLine, companyTaxLine(receipt)),
    slotBox(karmartValueSlots.signatureBy, receipt.signatureBy),
    slotBox(karmartValueSlots.signatureDate, receipt.signatureDate),
    slotBox(karmartValueSlots.orderNo, receipt.orderNo),
    slotBox(karmartValueSlots.buyerName, receipt.buyerName),
    slotBox(karmartValueSlots.buyerAddress, buyerAddressText(receipt.buyerAddress)),
    slotBox(karmartValueSlots.buyerTaxId, receipt.buyerTaxId),
    slotBox(karmartValueSlots.buyerBranch, receipt.buyerBranch),
    slotBox(karmartValueSlots.documentNo, receipt.documentNo),
    slotBox(karmartValueSlots.documentDate, receipt.documentDate),
    slotBox(karmartValueSlots.refDocNo, receipt.refDocNo),
    slotBox(karmartValueSlots.refDate, receipt.refDate),
    slotBox(karmartValueSlots.note, receipt.note),
    slotBox(karmartValueSlots.amount, formatKarmartMoney(receipt.amount)),
    slotBox(karmartValueSlots.discount, formatKarmartMoney(receipt.discount)),
    slotBox(karmartValueSlots.netAmount, formatKarmartMoney(receipt.netAmount)),
    slotBox(karmartValueSlots.vat, formatKarmartMoney(receipt.vat)),
    slotBox(karmartValueSlots.total, formatKarmartMoney(receipt.total)),
    slotBox(karmartValueSlots.amountInWords, receipt.amountInWords),
    slotBox(karmartValueSlots.footer, receipt.footer),
  ]
  const rows = visibleKarmartItems(receipt.items).flatMap((item, index) => [
    slotBox(itemSlot(itemColumns.item, index), String(index + 1)),
    slotBox(itemSlot(itemColumns.productCode, index), item.productCode),
    slotBox(itemSlot(itemColumns.description, index), item.description),
    slotBox(
      itemSlot(itemColumns.quantity, index),
      formatKarmartMoney(item.quantity),
    ),
    slotBox(
      itemSlot(itemColumns.unitPrice, index),
      formatKarmartMoney(item.unitPrice),
    ),
    slotBox(itemSlot(itemColumns.amount, index), formatKarmartMoney(item.amount)),
  ])

  const cssW = n(PAGE_WIDTH_PT * KARMART_PX)
  const cssH = n(PAGE_HEIGHT_PT * KARMART_PX)
  return `<div ${KARMART_RECEIPT_MARK} style="position:relative;width:${cssW}px;height:${cssH}px;background:#fff;overflow:hidden">
<svg xmlns="http://www.w3.org/2000/svg" width="${cssW}" height="${cssH}" viewBox="0 0 ${n(PAGE_WIDTH_PT)} ${n(PAGE_HEIGHT_PT)}" style="position:absolute;left:0;top:0">
${paths}
</svg>
<img src="data:image/jpeg;base64,${logo}" width="105" height="14.85" style="position:absolute;left:${px(35.85)};top:${px(35.85)};width:${px(105)};height:${px(14.85)}"/>
${labels.join("")}
${values.join("")}
${rows.join("")}
</div>`
}

export async function karmartRenderOptions(): Promise<RenderOptions> {
  const regular = await readFile(asset("AngsanaUPC-Regular-cmap.ttf"))
  const bold = await readFile(asset("AngsanaUPC-Bold-cmap.ttf"))
  const fonts: FontLoader[] = [
    { name: "AngsanaUPC", data: regular, weight: 400 },
    { name: "AngsanaUPCBold", data: bold, weight: 400 },
  ]
  return {
    size: {
      width: PAGE_WIDTH_PT * KARMART_PX,
      height: PAGE_HEIGHT_PT * KARMART_PX,
    },
    margin: 0,
    pageRanges: [1],
    fonts,
    fontFamilies: ["AngsanaUPC", "AngsanaUPCBold"],
    backgroundColor: "#ffffff",
  }
}

function asset(name: string): string {
  return join(process.cwd(), "src/assets/karmart", name)
}
