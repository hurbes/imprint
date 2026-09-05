# pdf-maker

Agents and the UI share one contract. Generate a PDF by posting design and data. Persist documents in local SQLite.

## Render

`POST /api/pdf`

```json
{
  "engine": "takumi",
  "design": { "kind": "template", "name": "invoice-classic" },
  "data": {
    "invoiceNumber": "INV-2026-003",
    "invoiceDate": "February 20, 2026",
    "dueDate": "March 22, 2026",
    "companyName": "pdfcn",
    "subtitle": "Innovative PDF Solutions",
    "companyAddress": "Nagpur, IN",
    "companyEmail": "hello@pdfcn.app",
    "billTo": {
      "name": "Enterprise Corp",
      "address": "500 Enterprise Way, Building A",
      "email": "finance@enterprisecorp.io",
      "phone": "+1 (555) 246-8135"
    },
    "items": [{ "description": "Annual License Plan", "quantity": 1, "unitPrice": 25000 }],
    "summary": { "subtotal": 25000, "tax": 1750, "total": 26750 },
    "paymentTerms": {
      "dueDate": "March 22, 2026",
      "method": "ACH Transfer / Check",
      "gst": "GSTIN 123456789"
    }
  },
  "filename": "invoice.pdf"
}
```

Success is `application/pdf`. Failures are JSON `{ "kind", "message" }`.

`engine` is `takumi` or `forme`. Forme only accepts `{ "kind": "template", "name": "<template>" }`. Takumi also accepts `{ "kind": "html", "markup": "<div>Hello</div>" }`.

Templates: `invoice-classic`, `receipt-karmart`.

```bash
curl -X POST http://localhost:3000/api/pdf \
  -H 'content-type: application/json' \
  -d '{"engine":"takumi","design":{"kind":"html","markup":"<div>Hello</div>"},"data":{}}' \
  --output hello.pdf
```

## Documents

- `GET /api/documents`
- `POST /api/documents` with `{ title, engine, design, data }`
- `GET /api/documents/:id`
- `PATCH /api/documents/:id` with any of `{ title, engine, design, data }`
- `DELETE /api/documents/:id`
