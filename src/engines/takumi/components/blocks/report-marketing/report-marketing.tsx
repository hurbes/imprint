import { ReportTemplateFrame } from "./report-layout";
import type { ReportTemplateProps } from "./report-layout";
import type { BaseReportData } from "./report.types";

const sampleMarketingData: BaseReportData = {
  author: "Growth Team",
  generatedAt: "February 23, 2026",
  highlights: [
    "Channel mix improved CAC while maintaining lead quality.",
    "Lifecycle email workflow has deliverability issues under investigation.",
    "Referral program is producing higher-intent pipeline with lower cost.",
  ],
  period: "Campaign Cycle 2026-02",
  rows: [
    {
      label: "SEO",
      owner: "H. Evans",
      progress: 84,
      risk: "Low",
      status: "On Track",
    },
    {
      label: "Paid Search",
      owner: "K. Martin",
      progress: 80,
      risk: "Low",
      status: "On Track",
    },
    {
      label: "Lifecycle Email",
      owner: "V. Lee",
      progress: 64,
      risk: "Medium",
      status: "At Risk",
    },
    {
      label: "Partner Referrals",
      owner: "J. Gomez",
      progress: 75,
      risk: "Medium",
      status: "On Track",
    },
  ],
  series: [
    { label: "W1", value: 55 },
    { label: "W2", value: 57 },
    { label: "W3", value: 59 },
    { label: "W4", value: 60 },
    { label: "W5", value: 62 },
    { label: "W6", value: 63 },
    { label: "W7", value: 65 },
    { label: "W8", value: 67 },
    { label: "W9", value: 66 },
    { label: "W10", value: 68 },
    { label: "W11", value: 70 },
    { label: "W12", value: 72 },
  ],
  subtitle: "Pipeline, conversion efficiency, and channel performance",
  summary: [
    { label: "MQLs", tone: "success", trend: "+22.1% cycle", value: "3,940" },
    { label: "CAC", tone: "success", trend: "-7.4%", value: "$118" },
    { label: "Win Rate", tone: "info", trend: "+1.1 pts", value: "28.6%" },
    { label: "Churn Risk", tone: "warning", trend: "+0.8 pts", value: "6.2%" },
  ],
  title: "Growth & Marketing Report",
};

export const MarketingReportDocument = ({
  theme,
  data = sampleMarketingData,
}: ReportTemplateProps) => (
  <ReportTemplateFrame
    theme={theme}
    data={data}
    titlePrefix="Growth Report"
    statusLabel="Growth: Strong"
    statusTone="success"
    graphVariant="bar"
    graphTitle="Pipeline build by week"
    graphSubtitle="Demand creation output trend"
    graphLegend="none"
    graphShowValues
    graphColors={["#0EA5E9"]}
  />
);
