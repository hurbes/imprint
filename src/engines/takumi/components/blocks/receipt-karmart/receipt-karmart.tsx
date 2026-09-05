import { Document, Page } from "@/engines/takumi/lib/pdf-primitives"

export const ReceiptKarmartDocument = (_props: {
  data?: Record<string, unknown>
}) => (
  <Document>
    <Page size="A4" />
  </Document>
)
