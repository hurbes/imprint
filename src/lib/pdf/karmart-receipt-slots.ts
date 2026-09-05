import { karmartReceiptFixture } from "./karmart-receipt-fixture"

export const PAGE_WIDTH_PT = 595.35
export const PAGE_HEIGHT_PT = 841.95
export const KARMART_PX = 96 / 72

export const ITEM_ROW_TOP = 318.62
export const ITEM_ROW_HEIGHT = 17.85
export const TOTALS_BAND_Y = 633.85
export const MAX_ITEMS = Math.floor((TOTALS_BAND_Y - ITEM_ROW_TOP) / ITEM_ROW_HEIGHT)

export type KarmartItem = {
  productCode: string
  description: string
  quantity: number
  unitPrice: number
  amount: number
}

export type KarmartReceiptData = {
  page: string
  title: string
  companyName: string
  companyAddress: string
  companyTaxId: string
  companyBranch: string
  signatureBy: string
  signatureDate: string
  orderNo: string
  buyerName: string
  buyerAddress: [string, string]
  buyerTaxId: string
  buyerBranch: string
  documentNo: string
  documentDate: string
  refDocNo: string
  refDate: string
  items: KarmartItem[]
  amount: number
  discount: number
  netAmount: number
  vat: number
  total: number
  amountInWords: string
  note: string
  footer: string
}

export type KarmartFont = "AngsanaUPC" | "AngsanaUPCBold" | "THSarabunNew"

export type KarmartSlot = {
  left: number
  top: number
  width: number
  height: number
  size: number
  font: KarmartFont
  align?: "left" | "right"
  wrap?: boolean
}

export type KarmartLabel = {
  text: string
  slot: KarmartSlot
}

const regular = (
  left: number,
  top: number,
  width: number,
  height: number,
  size = 12,
): KarmartSlot => ({
  left,
  top,
  width,
  height,
  size,
  font: "AngsanaUPC",
})

const bold = (
  left: number,
  top: number,
  width: number,
  height: number,
  size = 12,
): KarmartSlot => ({
  left,
  top,
  width,
  height,
  size,
  font: "AngsanaUPCBold",
})

const right = (slot: KarmartSlot): KarmartSlot => ({
  ...slot,
  align: "right",
})

export const karmartLabels: KarmartLabel[] = [
  { text: "ใบสั่งซื้อเลขที่", slot: regular(440.85, 88.37, 45.1, 16.19) },
  { text: "ORDER NO.", slot: regular(440.85, 102.92, 42.25, 16.19) },
  { text: "ผู้ซื้อ/BUYER", slot: bold(37.83, 137.83, 45.13, 16.61) },
  { text: "เลขที่เอกสาร", slot: bold(358.35, 137.83, 40.94, 16.61) },
  { text: "NO.", slot: bold(358.35, 152.73, 13.86, 16.61) },
  { text: "วันที่", slot: bold(358.35, 167.83, 15.2, 16.61) },
  { text: "DATE", slot: bold(358.35, 182.73, 22.01, 16.61) },
  {
    text: "เลขประจำตัวผู้เสียภาษีอากร :",
    slot: bold(35.85, 235.33, 94.54, 16.61),
  },
  { text: "สาขา :", slot: regular(230.85, 235.37, 21.07, 16.19) },
  { text: "ที่อยู่/ADDRESS", slot: bold(35.85, 175.33, 53.58, 16.61) },
  { text: "อ้างอิงเอกสาร", slot: bold(358.35, 197.83, 44.29, 16.61) },
  { text: "REF. DOC NO.", slot: bold(358.35, 212.73, 53.24, 16.61) },
  { text: "วันที่", slot: bold(358.35, 227.83, 15.2, 16.61) },
  { text: "DATE", slot: bold(358.35, 242.73, 22.01, 16.61) },
  { text: "ลำดับ", slot: bold(34.2, 283.18, 18.24, 16.61) },
  { text: "ITEM", slot: bold(32.75, 298.08, 21.12, 16.61) },
  { text: "รหัสสินค้า", slot: bold(79.05, 283.18, 33.59, 16.61) },
  { text: "PRODUCT CODE", slot: bold(63.85, 298.08, 64.03, 16.61) },
  { text: "รายการ", slot: bold(218.7, 283.18, 24.23, 16.61) },
  { text: "DESCRIPTION", slot: bold(203.35, 298.08, 55.02, 16.61) },
  { text: "จำนวน", slot: bold(357.95, 283.18, 23.33, 16.61) },
  { text: "QUANTITY", slot: bold(348.25, 298.08, 42.7, 16.61) },
  { text: "ราคาต่อหน่วย", slot: bold(429.45, 283.18, 45.29, 16.61) },
  { text: "UNIT PRICE", slot: bold(428.85, 298.08, 46.44, 16.61) },
  { text: "จำนวนเงิน", slot: bold(512.8, 283.18, 34.82, 16.61) },
  { text: "AMOUNT", slot: bold(512.15, 298.08, 36.08, 16.61) },
  { text: "หมายเหตุ :", slot: regular(35.85, 633.62, 34.79, 16.19) },
  { text: "รวมเป็นเงิน AMOUNT", slot: regular(417.7, 636.46, 68.2, 14.84, 11) },
  { text: "ส่วนลด DISCOUNT", slot: regular(425.4, 656.01, 60.41, 14.84, 11) },
  {
    text: "มูลค่าสินค้าที่นำมาคิดภาษี NET AMOUNT",
    slot: regular(360, 682.36, 125.73, 14.84, 11),
  },
  { text: "ภาษีมูลค่าเพิ่ม VAT", slot: regular(428.5, 701.11, 57.33, 14.84, 11) },
  {
    text: "รวมจำนวนเงิน TOTAL AMOUNT",
    slot: bold(379.25, 723.6, 106.62, 15.22, 11),
  },
]

export const karmartValueSlots = {
  page: regular(386.9, 28.36, 32.87, 14.84, 11),
  title: bold(445.85, 28.33, 116.06, 22.14, 16),
  companyName: bold(148.35, 35.83, 138.7, 22.14, 16),
  companyAddress: regular(148.35, 58.37, 277.79, 16.19),
  companyTaxLine: regular(148.35, 74.57, 277.79, 16.19),
  signatureBy: regular(445.85, 49.34, 116.06, 5.0, 4.5),
  signatureDate: regular(445.85, 54.61, 116.06, 5.0, 4.5),
  orderNo: regular(490, 88.37, 70, 30.74),
  buyerName: regular(95.85, 137.87, 249.15, 16.19),
  buyerAddress: { ...regular(44, 190.37, 300, 44), wrap: true },
  buyerTaxId: regular(133.35, 235.37, 90, 16.19),
  buyerBranch: regular(255, 235.37, 90, 16.19),
  documentNo: regular(455.85, 137.87, 104.9, 16.19),
  documentDate: regular(455.85, 167.87, 104.9, 16.19),
  refDocNo: regular(455.85, 197.87, 104.9, 16.19),
  refDate: regular(455.85, 227.87, 104.9, 16.19),
  note: regular(70.64, 633.62, 250, 16.19),
  amount: right(regular(497, 636.47, 63.98, 16.19)),
  discount: right(regular(497, 656.12, 63.98, 16.19)),
  netAmount: right(regular(497, 681.32, 63.98, 16.19)),
  vat: right(regular(497, 701.07, 63.98, 16.19)),
  total: right(bold(497, 723.58, 63.98, 16.61)),
  amountInWords: regular(35.85, 723.62, 285, 16.19),
  footer: bold(35.85, 768.58, 524, 16.61),
}

export const itemColumns = {
  item: regular(32.75, ITEM_ROW_TOP, 22, ITEM_ROW_HEIGHT),
  productCode: regular(64, ITEM_ROW_TOP, 66, ITEM_ROW_HEIGHT),
  description: { ...regular(140.85, ITEM_ROW_TOP, 182, ITEM_ROW_HEIGHT), wrap: true },
  quantity: right(regular(332, ITEM_ROW_TOP, 75, ITEM_ROW_HEIGHT)),
  unitPrice: right(regular(415, ITEM_ROW_TOP, 74, ITEM_ROW_HEIGHT)),
  amount: right(regular(497, ITEM_ROW_TOP, 64, ITEM_ROW_HEIGHT)),
}

function asString(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback
}

function asNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback
}

function asItem(value: unknown, fallback: KarmartItem): KarmartItem {
  if (typeof value !== "object" || value === null) {
    return fallback
  }
  const row = value as Record<string, unknown>
  return {
    productCode: asString(row.productCode, fallback.productCode),
    description: asString(row.description, fallback.description),
    quantity: asNumber(row.quantity, fallback.quantity),
    unitPrice: asNumber(row.unitPrice, fallback.unitPrice),
    amount: asNumber(row.amount, fallback.amount),
  }
}

function asAddress(value: unknown): [string, string] {
  const fallback = karmartReceiptFixture.buyerAddress
  if (!Array.isArray(value)) {
    return [fallback[0], fallback[1]]
  }
  return [
    asString(value[0], fallback[0]),
    asString(value[1], fallback[1]),
  ]
}

export function normalizeKarmartData(
  data: Record<string, unknown>,
): KarmartReceiptData {
  const sampleItems = karmartReceiptFixture.items
  const rawItems = Array.isArray(data.items) ? data.items : sampleItems
  const items = rawItems.map((row, index) =>
    asItem(row, sampleItems[index] ?? sampleItems[0]!),
  )
  return {
    page: asString(data.page, karmartReceiptFixture.page),
    title: asString(data.title, karmartReceiptFixture.title),
    companyName: asString(data.companyName, karmartReceiptFixture.companyName),
    companyAddress: asString(
      data.companyAddress,
      karmartReceiptFixture.companyAddress,
    ),
    companyTaxId: asString(data.companyTaxId, karmartReceiptFixture.companyTaxId),
    companyBranch: asString(
      data.companyBranch,
      karmartReceiptFixture.companyBranch,
    ),
    signatureBy: asString(data.signatureBy, karmartReceiptFixture.signatureBy),
    signatureDate: asString(
      data.signatureDate,
      karmartReceiptFixture.signatureDate,
    ),
    orderNo: asString(data.orderNo, karmartReceiptFixture.orderNo),
    buyerName: asString(data.buyerName, karmartReceiptFixture.buyerName),
    buyerAddress: asAddress(data.buyerAddress),
    buyerTaxId: asString(data.buyerTaxId, karmartReceiptFixture.buyerTaxId),
    buyerBranch: asString(data.buyerBranch, karmartReceiptFixture.buyerBranch),
    documentNo: asString(data.documentNo, karmartReceiptFixture.documentNo),
    documentDate: asString(
      data.documentDate,
      karmartReceiptFixture.documentDate,
    ),
    refDocNo: asString(data.refDocNo, karmartReceiptFixture.refDocNo),
    refDate: asString(data.refDate, karmartReceiptFixture.refDate),
    items,
    amount: asNumber(data.amount, karmartReceiptFixture.amount),
    discount: asNumber(data.discount, karmartReceiptFixture.discount),
    netAmount: asNumber(data.netAmount, karmartReceiptFixture.netAmount),
    vat: asNumber(data.vat, karmartReceiptFixture.vat),
    total: asNumber(data.total, karmartReceiptFixture.total),
    amountInWords: asString(
      data.amountInWords,
      karmartReceiptFixture.amountInWords,
    ),
    note: asString(data.note, karmartReceiptFixture.note),
    footer: asString(data.footer, karmartReceiptFixture.footer),
  }
}

export function visibleKarmartItems(items: KarmartItem[]): KarmartItem[] {
  return items.slice(0, MAX_ITEMS)
}

export function companyTaxLine(data: KarmartReceiptData): string {
  return `เลขประจำตัวผู้เสียภาษีอากร  ${data.companyTaxId} (${data.companyBranch})`
}

export function formatKarmartMoney(value: number): string {
  return value.toFixed(2)
}

export function karmartSafeText(text: string): string {
  return text.replaceAll("ำ", "ํา")
}

export function buyerAddressText(address: [string, string]): string {
  return address.filter((line) => line.trim() !== "").join("\n")
}

export function itemSlot(base: KarmartSlot, index: number): KarmartSlot {
  return {
    ...base,
    top: ITEM_ROW_TOP + index * ITEM_ROW_HEIGHT,
  }
}
