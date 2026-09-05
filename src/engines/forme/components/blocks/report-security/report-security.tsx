import { ReportTemplateFrame } from "./report-layout";
import type { ReportTemplateProps } from "./report-layout";
import type { BaseReportData } from "./report.types";

const sampleSecurityData: BaseReportData = {
  author: "Security Engineering",
  generatedAt: "February 23, 2026",
  highlights: [
    "Critical vulnerabilities reduced through mandatory patch windows.",
    "Secrets rotation remains the highest-risk stream and needs additional staffing.",
    "External penetration test scheduled for next sprint to validate fixes.",
  ],
  period: "Sprint 05, 2026",
  rows: [
    {
      label: "Identity Hardening",
      owner: "E. Brown",
      progress: 87,
      risk: "Low",
      status: "On Track",
    },
    {
      label: "Secrets Rotation",
      owner: "P. Nair",
      progress: 58,
      risk: "High",
      status: "At Risk",
    },
    {
      label: "Dependency Scanning",
      owner: "I. Shah",
      progress: 81,
      risk: "Medium",
      status: "On Track",
    },
    {
      label: "WAF Policy",
      owner: "S. Reed",
      progress: 76,
      risk: "Low",
      status: "On Track",
    },
  ],
  series: [
    { label: "W1", value: 61 },
    { label: "W2", value: 63 },
    { label: "W3", value: 64 },
    { label: "W4", value: 66 },
    { label: "W5", value: 67 },
    { label: "W6", value: 68 },
    { label: "W7", value: 69 },
    { label: "W8", value: 71 },
    { label: "W9", value: 72 },
    { label: "W10", value: 74 },
    { label: "W11", value: 76 },
    { label: "W12", value: 78 },
  ],
  subtitle: "Vulnerability trends, control maturity, and remediation health",
  summary: [
    {
      label: "Critical Vulns",
      tone: "success",
      trend: "-3 from last sprint",
      value: "2",
    },
    { label: "Patch SLA", tone: "success", trend: "+5.3 pts", value: "92.0%" },
    { label: "Open Findings", tone: "warning", trend: "+4", value: "41" },
    { label: "Control Score", tone: "info", trend: "+2 pts", value: "84/100" },
  ],
  title: "Security Posture Report",
};

export const SecurityReportDocument = ({
  theme,
  data = sampleSecurityData,
}: ReportTemplateProps) => (
  <ReportTemplateFrame
    theme={theme}
    data={data}
    titlePrefix="Security Report"
    statusLabel="Security: Action Needed"
    statusTone="destructive"
    graphVariant="donut"
    graphTitle="Open risk distribution"
    graphSubtitle="High/Medium/Low workload share"
    graphLegend="right"
    graphShowValues
    graphColors={["#DC2626", "#F59E0B", "#16A34A", "#0EA5E9"]}
    graphData={[
      { label: "High Risk", value: 14 },
      { label: "Medium Risk", value: 17 },
      { label: "Low Risk", value: 8 },
      { label: "Info", value: 4 },
    ]}
  />
);
