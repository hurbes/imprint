export const invoiceMinimalFixture = {
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
    { description: "Annual License Plan", quantity: 1, unitPrice: 25000 },
    { description: "Support & Maintenance", quantity: 12, unitPrice: 1500 },
    { description: "Custom Integration", quantity: 1, unitPrice: 12000 },
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
    subtotal: 55000,
    tax: 3850,
    total: 58850,
  },
} as const
