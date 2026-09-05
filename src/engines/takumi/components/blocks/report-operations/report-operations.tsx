import { ReportTemplateFrame } from "./report-layout";
import type { ReportTemplateProps } from "./report-layout";
import type { BaseReportData } from "./report.types";

const sampleOperationsData: BaseReportData = {
  author: "Delivery Office",
  generatedAt: "February 23, 2026",
  highlights: [
    "SLA improved after shift rebalancing and incident triage changes.",
    "Backlog grew in week 4 due to release-related ticket surge.",
    "Incident queue remediation plan has executive sponsorship and budget.",
  ],
  period: "February 2026",
  rows: [
    {
      label: "L1 Support",
      owner: "N. Mehta",
      progress: 91,
      risk: "Low",
      status: "On Track",
    },
    {
      label: "L2 Support",
      owner: "D. Chen",
      progress: 85,
      risk: "Low",
      status: "On Track",
    },
    {
      label: "Incident Queue",
      owner: "R. Walker",
      progress: 66,
      risk: "High",
      status: "At Risk",
    },
    {
      label: "Automation Rollout",
      owner: "M. Roy",
      progress: 77,
      risk: "Medium",
      status: "On Track",
    },
  ],
  series: [
    { label: "W1", value: 69 },
    { label: "W2", value: 71 },
    { label: "W3", value: 73 },
    { label: "W4", value: 74 },
    { label: "W5", value: 75 },
    { label: "W6", value: 76 },
    { label: "W7", value: 78 },
    { label: "W8", value: 79 },
    { label: "W9", value: 78 },
    { label: "W10", value: 80 },
    { label: "W11", value: 81 },
    { label: "W12", value: 83 },
  ],
  subtitle: "Delivery throughput, SLA adherence, and backlog visibility",
  summary: [
    {
      label: "Tickets Closed",
      tone: "success",
      trend: "+9.8% MoM",
      value: "1,284",
    },
    {
      label: "SLA Hit Rate",
      tone: "success",
      trend: "+1.4 pts",
      value: "96.1%",
    },
    { label: "Backlog", tone: "warning", trend: "+6.0%", value: "214" },
    { label: "Escalations", tone: "success", trend: "-18.5%", value: "17" },
  ],
  title: "Monthly Operations Report",
};

export const OperationsReportDocument = ({
  theme,
  data = sampleOperationsData,
}: ReportTemplateProps) => (
  <ReportTemplateFrame
    theme={theme}
    data={data}
    titlePrefix="Operations Report"
    statusLabel="Ops: Watch"
    statusTone="warning"
    graphVariant="horizontal-bar"
    graphTitle="Throughput by week"
    graphSubtitle="Resolved workload distribution"
    graphLegend="none"
    graphShowValues
    graphColors={["#2563EB"]}
    graphData={[
      { label: "Incident", value: 66 },
      { label: "Automation", value: 77 },
      { label: "L2 Support", value: 85 },
      { label: "L1 Support", value: 91 },
    ]}
  />
);
