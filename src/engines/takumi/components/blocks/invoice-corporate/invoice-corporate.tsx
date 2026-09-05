import { KeyValue } from "@/engines/takumi/components/key-value/key-value";
import { PageFooter } from "@/engines/takumi/components/page-footer/page-footer";
import { PageHeader } from "@/engines/takumi/components/page-header/page-header";
import { PdfImage } from "@/engines/takumi/components/pdf-image/pdf-image";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/engines/takumi/components/table/table";
import { Text } from "@/engines/takumi/components/text/text";
import {
  PdfcnThemeProvider,
  usePdfcnTheme,
} from "@/engines/takumi/components/theme-provider";
import {
  View,
  StyleSheet,
  Document,
  Page,
} from "@/engines/takumi/lib/pdf-primitives";
import type { PdfcnTheme } from "@/types/pdf-themes";

import type { InvoiceCorporateData } from "./invoice-corporate.types";

const sampleData: InvoiceCorporateData = {
  billTo: {
    address: "100 Corporate Plaza, Tower B",
    email: "accounts@globalindustries.com",
    name: "Global Industries Ltd.",
    phone: "+1 (555) 888-9999",
  },
  companyAddress: "Nagpur, IN",
  companyEmail: "hello@pdfcn.app",
  companyName: "pdfcn",
  dueDate: "March 24, 2026",
  invoiceDate: "February 22, 2026",
  invoiceNumber: "INV-2026-004",
  items: [
    {
      description: "Enterprise Software License",
      quantity: 5,
      unitPrice: 4500,
    },
    { description: "Implementation Services", quantity: 1, unitPrice: 18_000 },
    {
      description: "Training Workshop (per session)",
      quantity: 3,
      unitPrice: 2500,
    },
    { description: "Annual Support Package", quantity: 1, unitPrice: 8500 },
  ],
  logo: "/favicon.png",
  notes:
    "Corporate billing – Net 30 terms apply. For inquiries, contact accounts@pdfcn.app",
  paymentTerms: {
    dueDate: "March 24, 2026",
    gst: "GSTIN 987654321",
    method: "Wire Transfer / Corporate Account",
  },
  subtitle: "Innovative PDF Solutions",
  summary: {
    subtotal: 56_500,
    tax: 4520,
    total: 61_020,
  },
};

const InvoiceCorporateContent = ({ data }: { data: InvoiceCorporateData }) => {
  const theme = usePdfcnTheme();

  const styles = StyleSheet.create({
    infoColumn: {
      flex: 1,
    },
    infoGrid: {
      flexDirection: "row",
      gap: 24,
      marginBottom: theme.spacing.sectionGap,
    },
    infoLabel: {
      color: theme.colors.mutedForeground,
      fontSize: 9,
      fontWeight: "bold",
      letterSpacing: 0.6,
      marginBottom: 6,
      textTransform: "uppercase",
    },
    page: {
      backgroundColor: theme.colors.background,
      boxSizing: "border-box",
      minHeight: 841,
      padding: theme.spacing.page.marginTop,
      paddingBottom: theme.spacing.page.marginBottom,
      position: "relative",
    },
    summaryCard: {
      backgroundColor: theme.colors.muted,
      borderRadius: theme.primitives.borderRadius.md,
      marginTop: 20,
      padding: 16,
    },
    summaryRow: {
      flexDirection: "row",
      justifyContent: "flex-end",
    },
  });

  return (
    <Document title={`Invoice ${data.invoiceNumber}`}>
      <Page size="A4" style={styles.page}>
        <PageHeader
          variant="logo-right"
          logo={
            <PdfImage
              src={data.logo ?? "/favicon.png"}
              width={56}
              height={56}
              style={{ margin: 0 }}
            />
          }
          title={data.companyName}
          subtitle={`${data.subtitle}  ·  ${data.companyAddress}`}
          style={{ marginBottom: theme.spacing.sectionGap }}
        />
        <View style={styles.infoGrid}>
          <View style={styles.infoColumn}>
            <Text style={styles.infoLabel} noMargin>
              Invoice Details
            </Text>
            <KeyValue
              size="sm"
              items={[
                { key: "Invoice #", value: data.invoiceNumber },
                { key: "Issue Date", value: data.invoiceDate },
                { key: "Due Date", value: data.dueDate },
                { key: "Payment", value: data.paymentTerms.method },
              ]}
            />
          </View>
          <View style={styles.infoColumn}>
            <Text style={styles.infoLabel} noMargin>
              Bill To
            </Text>
            <Text variant="sm" weight="semibold" noMargin>
              {data.billTo.name}
            </Text>
            <Text variant="xs" noMargin color="mutedForeground">
              {data.billTo.address}
            </Text>
            <Text variant="xs" noMargin color="mutedForeground">
              {data.billTo.email}
            </Text>
            <Text variant="xs" noMargin color="mutedForeground">
              {data.billTo.phone}
            </Text>
          </View>
        </View>
        <Table variant="bordered">
          <TableHeader>
            <TableRow header>
              <TableCell>Description</TableCell>
              <TableCell align="center">Qty</TableCell>
              <TableCell align="right">Unit Price</TableCell>
              <TableCell align="right">Amount</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.items.map((item, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: static PDF list, no reordering
              <TableRow key={index}>
                <TableCell>{item.description}</TableCell>
                <TableCell align="center">{`${item.quantity}`}</TableCell>
                <TableCell align="right">{`$${item.unitPrice.toLocaleString()}`}</TableCell>
                <TableCell align="right">{`$${(item.quantity * item.unitPrice).toLocaleString()}`}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={{ width: 260 }}>
              <KeyValue
                size="md"
                dividerThickness={1}
                dividerColor="border"
                items={[
                  {
                    key: "Subtotal",
                    value: `$${data.summary.subtotal.toLocaleString()}`,
                  },
                  { key: "Tax (8%)", value: `$${data.summary.tax.toFixed(2)}` },
                  {
                    key: "Total Due",
                    keyStyle: { fontSize: 13, fontWeight: "bold" },
                    value: `$${data.summary.total.toFixed(2)}`,
                    valueStyle: {
                      color: theme.colors.primary,
                      fontSize: 14,
                      fontWeight: "bold",
                    },
                  },
                ]}
                divided
              />
            </View>
          </View>
        </View>
        <PageFooter
          leftText={data.notes}
          rightText="Page 1 of 1"
          sticky
          pagePadding={25}
        />
      </Page>
    </Document>
  );
};

export const InvoiceCorporateDocument = ({
  theme,
  data = sampleData,
}: {
  theme?: PdfcnTheme;
  data?: InvoiceCorporateData;
}) => (
  <PdfcnThemeProvider theme={theme}>
    <InvoiceCorporateContent data={data} />
  </PdfcnThemeProvider>
);
