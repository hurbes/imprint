import { Document, Page, StyleSheet, View } from "@formepdf/react";

import { Badge } from "@/engines/forme/components/badge/badge";
import { DataTable } from "@/engines/forme/components/data-table/data-table";
import { PdfGraph } from "@/engines/forme/components/graph/graph";
import { KeyValue } from "@/engines/forme/components/key-value/key-value";
import { PdfList } from "@/engines/forme/components/list/list";
import { PageFooter } from "@/engines/forme/components/page-footer/page-footer";
import { PageHeader } from "@/engines/forme/components/page-header/page-header";
import { Section } from "@/engines/forme/components/section/section";
import { Text } from "@/engines/forme/components/text/text";
import {
  PdfcnThemeProvider,
  usePdfcnTheme,
} from "@/engines/forme/components/theme-provider";
import type { PdfcnTheme } from "@/types/pdf-themes";

import type { BaseReportData } from "./report.types";

export interface ReportTemplateProps {
  theme?: PdfcnTheme;
  data?: BaseReportData;
}

type ReportGraphVariant =
  | "bar"
  | "horizontal-bar"
  | "line"
  | "area"
  | "pie"
  | "donut";

interface ReportLayoutProps {
  data: BaseReportData;
  titlePrefix: string;
  statusLabel: string;
  statusTone: "success" | "warning" | "destructive" | "info";
  graphVariant: ReportGraphVariant;
  graphTitle: string;
  graphSubtitle: string;
  graphLegend?: "bottom" | "right" | "none";
  graphShowValues?: boolean;
  graphColors?: string[];
  graphData?: { label: string; value: number }[];
}

const toneColor = (
  theme: PdfcnTheme,
  tone: "success" | "warning" | "destructive" | "info"
) => {
  if (tone === "success") {
    return theme.colors.success;
  }
  if (tone === "warning") {
    return theme.colors.warning;
  }
  if (tone === "destructive") {
    return theme.colors.destructive;
  }
  return theme.colors.info;
};

export const ReportLayout = ({
  data,
  titlePrefix,
  statusLabel,
  statusTone,
  graphVariant,
  graphTitle,
  graphSubtitle,
  graphLegend = "none",
  graphShowValues = false,
  graphColors,
  graphData,
}: ReportLayoutProps) => {
  const theme = usePdfcnTheme();
  const accent = toneColor(theme, statusTone);
  const graphHeight: Record<ReportGraphVariant, number> = {
    area: 191,
    bar: 181,
    donut: 191,
    "horizontal-bar": 148,
    line: 191,
    pie: 191,
  };
  const deliveryOffset: Record<ReportGraphVariant, number> = {
    area: 0,
    bar: 59,
    donut: -3,
    "horizontal-bar": -4,
    line: -30,
    pie: 0,
  };
  const sectionOffset: Record<ReportGraphVariant, number> = {
    area: 0,
    bar: 32,
    donut: 0,
    "horizontal-bar": 0,
    line: 0,
    pie: 0,
  };
  const titleOffset: Record<ReportGraphVariant, number> = {
    area: 0,
    bar: 0,
    donut: 0,
    "horizontal-bar": 0,
    line: 0,
    pie: 0,
  };

  const styles = StyleSheet.create({
    col: {
      width: 225,
    },
    graphShell: {
      backgroundColor: theme.colors.background,
      borderColor: theme.colors.border,
      borderRadius: theme.primitives.borderRadius.md,
      borderStyle: "solid",
      borderWidth: 1,
      padding: 12,
    },
    metricCard: {
      alignItems: "flex-start",
      backgroundColor: theme.colors.background,
      borderColor: theme.colors.border,
      borderRadius: theme.primitives.borderRadius.md,
      borderStyle: "solid",
      borderWidth: 1,
      height: 75,
      padding: 8,
      width: 225,
    },
    metricLabel: {
      color: theme.colors.mutedForeground,
      fontSize: 8,
      letterSpacing: 0.5,
      marginBottom: 2,
      textTransform: "uppercase",
    },
    metricTrend: {
      color: theme.colors.mutedForeground,
      fontSize: 9,
    },
    metricValue: {
      color: theme.colors.foreground,
      fontSize: 14,
      fontWeight: theme.primitives.fontWeights.bold,
      marginBottom: 2,
    },
    metricsGrid: {
      flexDirection: "column",
      gap: 8,
    },
    metricsRow: {
      flexDirection: "row",
      gap: 8,
    },
    page: {
      backgroundColor: theme.colors.background,
    },
    toolbar: {
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 8,
      width: 499,
    },
    twoColumn: {
      alignItems: "flex-start",
      flexDirection: "row",
      gap: 10,
    },
  });

  return (
    <Document title={`${titlePrefix} ${data.period}`}>
      <Page size="A4" margin={{ bottom: 48, left: 48, right: 48, top: 56 }}>
        <PageFooter
          variant="three-column"
          leftText="Confidential — Internal Use"
          centerText="Generated with pdfcn"
          rightText="Page 1 of 1"
          sticky
          pagePadding={theme.spacing.page.marginLeft}
        />
        <View style={styles.page as never}>
          <PageHeader
            variant="two-column"
            title={data.title}
            subtitle={`${titlePrefix} · ${data.subtitle}`}
            rightText={data.period}
            rightSubText={`Generated ${data.generatedAt}`}
            marginBottom={14}
          />

          <View style={styles.toolbar}>
            <Badge label={statusLabel} variant={statusTone} size="sm" />
            <Text variant="xs" color="mutedForeground" noMargin>
              Author: {data.author}
            </Text>
          </View>

          <Section variant="card" padding="md" noWrap>
            <Text variant="sm" transform="uppercase" color="mutedForeground">
              Executive Summary
            </Text>
            <View style={styles.metricsGrid}>
              {[0, 2].map((startIndex) => (
                <View key={startIndex} style={styles.metricsRow}>
                  {data.summary
                    .slice(startIndex, startIndex + 2)
                    .map((metric) => (
                      <View
                        key={metric.label}
                        style={
                          {
                            ...styles.metricCard,
                            borderLeftColor: metric.tone
                              ? toneColor(theme, metric.tone)
                              : accent,
                            borderLeftWidth: 3,
                          } as never
                        }
                      >
                        <Text style={styles.metricLabel} noMargin>
                          {metric.label}
                        </Text>
                        <Text style={styles.metricValue} noMargin>
                          {metric.value}
                        </Text>
                        {metric.trend ? (
                          <Badge
                            label={metric.trend}
                            size="sm"
                            variant={metric.tone ?? "info"}
                            style={{
                              height: 16,
                              width: metric.trend.endsWith("QoQ")
                                ? metric.trend.length * 6.5 + 10
                                : metric.trend.length * 5 + 18,
                            }}
                          />
                        ) : null}
                      </View>
                    ))}
                </View>
              ))}
            </View>
          </Section>
        </View>
      </Page>

      <Page size="A4" margin={{ bottom: 48, left: 48, right: 48, top: 56 }}>
        <PageFooter
          variant="three-column"
          leftText="Confidential — Internal Use"
          centerText="Generated with pdfcn"
          rightText="Page 1 of 1"
          sticky
          pagePadding={theme.spacing.page.marginLeft}
        />
        <View style={styles.page as never}>
          <Section
            padding="md"
            noWrap
            style={{
              position: "relative",
              top: sectionOffset[graphVariant],
            }}
          >
            <Text
              variant="sm"
              transform="uppercase"
              color="mutedForeground"
              style={{
                position: "relative",
                top: titleOffset[graphVariant],
              }}
            >
              Performance Trend
            </Text>
            <View
              style={
                {
                  ...styles.graphShell,
                  paddingBottom: graphVariant === "horizontal-bar" ? 56 : 12,
                } as never
              }
            >
              <PdfGraph
                variant={graphVariant}
                data={graphData ?? data.series}
                title={graphTitle}
                subtitle={graphSubtitle}
                yLabel={undefined}
                xLabel={undefined}
                showGrid={graphVariant !== "pie" && graphVariant !== "donut"}
                showValues={graphShowValues}
                smooth={graphVariant === "line" || graphVariant === "area"}
                legend={graphLegend}
                height={graphHeight[graphVariant]}
                colors={graphColors}
                fullWidth
                containerPadding={12}
                wrapperPadding={12}
                style={{ marginBottom: 0 }}
              />
            </View>
          </Section>

          <Section
            padding="md"
            style={{
              position: "relative",
              top: deliveryOffset[graphVariant],
            }}
          >
            <Text variant="sm" transform="uppercase" color="mutedForeground">
              Delivery Table
            </Text>
            <DataTable
              variant="compact"
              size="compact"
              stripe
              columns={[
                { header: "Stream", key: "label" },
                { header: "Owner", key: "owner" },
                { align: "center", header: "Status", key: "status" },
                {
                  align: "right",
                  header: "Progress",
                  key: "progress",
                  render: (value) => `${String(value)}%`,
                },
                { align: "right", header: "Risk", key: "risk" },
              ]}
              data={data.rows}
              footer={{
                label: "Totals",
                owner: "-",
                progress: Math.round(
                  data.rows.reduce((sum, row) => sum + row.progress, 0) /
                    Math.max(data.rows.length, 1)
                ),
                risk: "-",
                status: "-",
              }}
            />
          </Section>
        </View>
      </Page>

      <Page size="A4" margin={{ bottom: 48, left: 48, right: 48, top: 56 }}>
        <PageFooter
          variant="three-column"
          leftText="Confidential — Internal Use"
          centerText="Generated with pdfcn"
          rightText="Page 1 of 1"
          sticky
          pagePadding={theme.spacing.page.marginLeft}
        />
        <View style={styles.page as never}>
          <Section padding="md" variant="card" noWrap>
            <Text variant="sm" transform="uppercase" color="mutedForeground">
              Highlights & Risks
            </Text>
            <View style={styles.twoColumn}>
              <View style={styles.col}>
                <PdfList
                  variant="checklist"
                  items={data.highlights.map((item) => ({
                    checked: true,
                    text: item,
                  }))}
                  gap="sm"
                />
              </View>
              <View style={styles.col}>
                <KeyValue
                  size="sm"
                  divided
                  items={[
                    {
                      key: "Open Risks",
                      value: `${data.rows.filter((r) => r.risk !== "Low").length}`,
                    },
                    {
                      key: "On-Track Streams",
                      value: `${data.rows.filter((r) => r.status === "On Track").length}/${data.rows.length}`,
                    },
                    {
                      key: "Avg Progress",
                      value: `${Math.round(
                        data.rows.reduce((sum, row) => sum + row.progress, 0) /
                          Math.max(data.rows.length, 1)
                      )}%`,
                    },
                  ]}
                />
              </View>
            </View>
          </Section>
        </View>
      </Page>
    </Document>
  );
};

export const ReportTemplateFrame = ({
  theme,
  data,
  titlePrefix,
  statusLabel,
  statusTone,
  graphVariant,
  graphTitle,
  graphSubtitle,
  graphLegend,
  graphShowValues,
  graphColors,
  graphData,
}: ReportTemplateProps & {
  titlePrefix: string;
  statusLabel: string;
  statusTone: "success" | "warning" | "destructive" | "info";
  graphVariant: ReportGraphVariant;
  graphTitle: string;
  graphSubtitle: string;
  graphLegend?: "bottom" | "right" | "none";
  graphShowValues?: boolean;
  graphColors?: string[];
  graphData?: { label: string; value: number }[];
}) => {
  if (!data) {
    return null;
  }

  return (
    <PdfcnThemeProvider theme={theme}>
      <ReportLayout
        data={data}
        titlePrefix={titlePrefix}
        statusLabel={statusLabel}
        statusTone={statusTone}
        graphVariant={graphVariant}
        graphTitle={graphTitle}
        graphSubtitle={graphSubtitle}
        graphLegend={graphLegend}
        graphShowValues={graphShowValues}
        graphColors={graphColors}
        graphData={graphData}
      />
    </PdfcnThemeProvider>
  );
};
