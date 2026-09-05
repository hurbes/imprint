import { readFileSync } from "node:fs"
import { join } from "node:path"

import { Document, Image, Page, Text, View } from "@formepdf/react"

import {
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
} from "@/lib/pdf/karmart-receipt-slots"

const logoSrc = `data:image/jpeg;base64,${readFileSync(
  join(process.cwd(), "src/assets/karmart/logo.jpeg"),
).toString("base64")}`

function Slot({
  slot,
  text,
}: {
  slot: KarmartSlot
  text: string
}) {
  if (text === "") {
    return null
  }
  return (
    <View
      style={{
        position: "absolute",
        left: slot.left,
        top: slot.top,
        width: slot.width,
        height: slot.height,
        overflow: "hidden",
      }}
    >
      <Text
        wrap={Boolean(slot.wrap)}
        style={{
          fontSize: slot.size,
          fontWeight: slot.font === "AngsanaUPCBold" ? "bold" : "normal",
          textAlign: slot.align ?? "left",
          lineHeight: slot.wrap ? 1.2 : slot.height / slot.size,
        }}
      >
        {karmartSafeText(text)}
      </Text>
    </View>
  )
}

function HLine({ x, y, width }: { x: number; y: number; width: number }) {
  return (
    <View
      style={{
        position: "absolute",
        left: x,
        top: y,
        width,
        height: 0.5,
        backgroundColor: "#000",
      }}
    />
  )
}

function VLine({ x, y, height }: { x: number; y: number; height: number }) {
  return (
    <View
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: 0.5,
        height,
        backgroundColor: "#000",
      }}
    />
  )
}

function Frame({
  left,
  top,
  width,
  height,
}: {
  left: number
  top: number
  width: number
  height: number
}) {
  return (
    <View
      style={{
        position: "absolute",
        left,
        top,
        width,
        height,
        borderColor: "#000",
        borderStyle: "solid",
        borderWidth: 0.5,
        borderRadius: 9.5,
      }}
    />
  )
}

export const ReceiptKarmartDocument = ({
  data = {},
}: {
  data?: Record<string, unknown>
}) => {
  const receipt = normalizeKarmartData(data)
  const rows = visibleKarmartItems(receipt.items)
  return (
    <Document>
      <Page
        size={{ width: PAGE_WIDTH_PT, height: PAGE_HEIGHT_PT }}
        margin={0}
        style={{ backgroundColor: "#fff" }}
      >
        <View
          style={{
            position: "absolute",
            left: 35.85,
            top: 35.85,
            width: 105,
            height: 14.85,
          }}
        >
          <Image src={logoSrc} style={{ width: 105, height: 14.85 }} />
        </View>
        <Frame left={28.6} top={130.6} width={538.15} height={134.5} />
        <Frame left={28.6} top={280.6} width={538.15} height={465.25} />
        <VLine x={351.1} y={130.35} height={135} />
        <HLine x={28.35} y={318.1} width={538.65} />
        <HLine x={28.35} y={633.85} width={538.65} />
        <HLine x={28.35} y={719.15} width={538.65} />
        <HLine x={328.35} y={678.85} width={238.65} />
        <VLine x={58.6} y={280.35} height={353.25} />
        <VLine x={133.6} y={280.35} height={353.25} />
        <VLine x={328.6} y={280.35} height={465.75} />
        <VLine x={411.1} y={280.35} height={353.25} />
        <VLine x={493.6} y={280.35} height={465.75} />
        {karmartLabels.map((label) => (
          <Slot key={`${label.text}-${label.slot.left}-${label.slot.top}`} slot={label.slot} text={label.text} />
        ))}
        <Slot slot={karmartValueSlots.page} text={receipt.page} />
        <Slot slot={karmartValueSlots.title} text={receipt.title} />
        <Slot slot={karmartValueSlots.companyName} text={receipt.companyName} />
        <Slot slot={karmartValueSlots.companyAddress} text={receipt.companyAddress} />
        <Slot slot={karmartValueSlots.companyTaxLine} text={companyTaxLine(receipt)} />
        <Slot slot={karmartValueSlots.signatureBy} text={receipt.signatureBy} />
        <Slot slot={karmartValueSlots.signatureDate} text={receipt.signatureDate} />
        <Slot slot={karmartValueSlots.orderNo} text={receipt.orderNo} />
        <Slot slot={karmartValueSlots.buyerName} text={receipt.buyerName} />
        <Slot
          slot={karmartValueSlots.buyerAddress}
          text={buyerAddressText(receipt.buyerAddress)}
        />
        <Slot slot={karmartValueSlots.buyerTaxId} text={receipt.buyerTaxId} />
        <Slot slot={karmartValueSlots.buyerBranch} text={receipt.buyerBranch} />
        <Slot slot={karmartValueSlots.documentNo} text={receipt.documentNo} />
        <Slot slot={karmartValueSlots.documentDate} text={receipt.documentDate} />
        <Slot slot={karmartValueSlots.refDocNo} text={receipt.refDocNo} />
        <Slot slot={karmartValueSlots.refDate} text={receipt.refDate} />
        <Slot slot={karmartValueSlots.note} text={receipt.note} />
        <Slot slot={karmartValueSlots.amount} text={formatKarmartMoney(receipt.amount)} />
        <Slot slot={karmartValueSlots.discount} text={formatKarmartMoney(receipt.discount)} />
        <Slot slot={karmartValueSlots.netAmount} text={formatKarmartMoney(receipt.netAmount)} />
        <Slot slot={karmartValueSlots.vat} text={formatKarmartMoney(receipt.vat)} />
        <Slot slot={karmartValueSlots.total} text={formatKarmartMoney(receipt.total)} />
        <Slot slot={karmartValueSlots.amountInWords} text={receipt.amountInWords} />
        <Slot slot={karmartValueSlots.footer} text={receipt.footer} />
        {rows.map((item, index) => (
          <View key={`${item.productCode}-${index}`}>
            <Slot slot={itemSlot(itemColumns.item, index)} text={String(index + 1)} />
            <Slot slot={itemSlot(itemColumns.productCode, index)} text={item.productCode} />
            <Slot slot={itemSlot(itemColumns.description, index)} text={item.description} />
            <Slot
              slot={itemSlot(itemColumns.quantity, index)}
              text={formatKarmartMoney(item.quantity)}
            />
            <Slot
              slot={itemSlot(itemColumns.unitPrice, index)}
              text={formatKarmartMoney(item.unitPrice)}
            />
            <Slot
              slot={itemSlot(itemColumns.amount, index)}
              text={formatKarmartMoney(item.amount)}
            />
          </View>
        ))}
      </Page>
    </Document>
  )
}
