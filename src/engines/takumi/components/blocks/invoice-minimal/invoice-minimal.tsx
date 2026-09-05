import { KeyValue } from "@/engines/takumi/components/key-value/key-value";
import { PageFooter } from "@/engines/takumi/components/page-footer/page-footer";
import { PageHeader } from "@/engines/takumi/components/page-header/page-header";
import { Section } from "@/engines/takumi/components/section/section";
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

import type { InvoiceMinimalData } from "./invoice-minimal.types";

// Sample data — replace with your own props or data source
const sampleData: InvoiceMinimalData = {
  billTo: {
    address: "500 Enterprise Way, Building A",
    email: "finance@enterprisecorp.io",
    name: "Enterprise Corp",
    phone: "+1 (555) 246-8135",
  },
  companyAddress: "Nagpur, IN",
  companyEmail: "hello@pdfcn.app",
  companyName: "pdfcn",
  dueDate: "March 22, 2026",
  invoiceDate: "February 20, 2026",
  invoiceNumber: "INV-2026-003",
  items: [
    { description: "Annual License Plan", quantity: 1, unitPrice: 25_000 },
    { description: "Support & Maintenance", quantity: 12, unitPrice: 1500 },
    { description: "Custom Integration", quantity: 1, unitPrice: 12_000 },
  ],
  notes:
    "Invoice for annual enterprise subscription. Please retain for your records.",
  paymentTerms: {
    dueDate: "March 22, 2026",
    gst: "GSTIN 123456789",
    method: "ACH Transfer / Check",
  },
  subtitle: "Innovative PDF Solutions",
  summary: {
    subtotal: 55_000,
    tax: 3850,
    total: 58_850,
  },
};

const InvoiceMinimalContent = ({ data }: { data: InvoiceMinimalData }) => {
  const theme = usePdfcnTheme();

  const styles = StyleSheet.create({
    infoLabel: {
      color: theme.colors.primary,
      fontSize: 8,
      fontWeight: "bold",
      letterSpacing: 0.8,
      marginBottom: 4,
      textTransform: "uppercase",
    },
    infoRow: {
      flexDirection: "row",
      marginBottom: theme.spacing.sectionGap,
    },
    invoiceStamp: {
      alignSelf: "flex-start",
      borderColor: theme.colors.primary,
      borderRadius: theme.primitives.borderRadius.sm,
      borderStyle: "solid",
      borderWidth: 2,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    page: {
      backgroundColor: theme.colors.background,
      boxSizing: "border-box",
      minHeight: 841,
      padding: theme.spacing.page.marginTop,
      paddingBottom: theme.spacing.page.marginBottom,
      position: "relative",
    },
  });

  return (
    <Document title={`Invoice ${data.invoiceNumber}`}>
      <Page size="A4" style={styles.page}>
        <Section
          noWrap
          style={{
            alignItems: "flex-start",
            flexDirection: "row",
            marginBottom: theme.spacing.sectionGap,
          }}
        >
          <View style={{ flex: 1 }}>
            <PageHeader
              variant="minimal"
              title={data.companyName}
              subtitle={`${data.companyAddress}  ·  ${data.companyEmail}`}
              marginBottom={0}
            />
          </View>
          <View style={styles.invoiceStamp}>
            <Text
              style={{
                color: theme.colors.primary,
                fontSize: 7,
                fontWeight: "bold",
                textAlign: "right",
              }}
              noMargin
              transform="uppercase"
            >
              Invoice
            </Text>
            <Text
              style={{
                color: theme.colors.foreground,
                fontSize: 14,
                fontWeight: "bold",
                textAlign: "right",
              }}
              noMargin
            >
              {data.invoiceNumber}
            </Text>
            <Text
              style={{
                color: theme.colors.mutedForeground,
                fontSize: 8,
                textAlign: "right",
              }}
              noMargin
            >
              {data.invoiceDate}
            </Text>
          </View>
        </Section>
        <View style={styles.infoRow}>
          <View style={{ paddingRight: 20, width: "50%" }}>
            <Text style={styles.infoLabel} noMargin>
              Bill To
            </Text>
            <Text variant="sm" noMargin>
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
          <View style={{ width: "50%" }}>
            <Text style={styles.infoLabel} noMargin>
              Invoice Details
            </Text>
            <KeyValue
              size="sm"
              items={[
                { key: "Due Date", value: data.dueDate },
                { key: "Payment", value: data.paymentTerms.method },
                { key: "GST", value: data.paymentTerms.gst },
              ]}
            />
          </View>
        </View>
        <Table variant="compact">
          <TableHeader>
            <TableRow header>
              <TableCell>Description</TableCell>
              <TableCell align="center">Qty</TableCell>
              <TableCell align="right">Rate</TableCell>
              <TableCell align="right">Total</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.items.map((item, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: invoice items have no stable id
              <TableRow key={index}>
                <TableCell>{item.description}</TableCell>
                <TableCell align="center">{`${item.quantity}`}</TableCell>
                <TableCell align="right">{`$${item.unitPrice.toLocaleString()}`}</TableCell>
                <TableCell align="right">{`$${(item.quantity * item.unitPrice).toFixed(2)}`}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Section noWrap style={{ flexDirection: "row", marginTop: 20 }}>
          <View style={{ flex: 1 }} />
          <View style={{ width: 240 }}>
            <KeyValue
              size="sm"
              dividerThickness={1}
              items={[
                {
                  key: "Subtotal",
                  value: `$${data.summary.subtotal.toFixed(2)}`,
                },
                { key: "Tax (7%)", value: `$${data.summary.tax.toFixed(2)}` },
                {
                  key: "Balance Due",
                  keyStyle: { fontSize: 12, fontWeight: "bold" },
                  value: `$${data.summary.total.toFixed(2)}`,
                  valueStyle: {
                    color: theme.colors.primary,
                    fontSize: 13,
                    fontWeight: "bold",
                  },
                },
              ]}
              divided
            />
          </View>
        </Section>
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

export const InvoiceMinimalDocument = ({
  theme,
  data = sampleData,
}: {
  theme?: PdfcnTheme;
  data?: InvoiceMinimalData;
}) => (
  <PdfcnThemeProvider theme={theme}>
    <InvoiceMinimalContent data={data} />
  </PdfcnThemeProvider>
);
