# valyuta-event

valyuta-event is a demo event, ticketing, CRM and accounting platform built for the Valyuta.az event concept.

## What Is Inside

- Public event pages
- Ticket checkout and buyer ticket cabinet
- QR ticket and check-in demo flow
- Admin panel for events, tickets, promo codes and print/PDF products
- Sales modules: orders, buyer cabinets and payments
- Accounting modules: income, expenses, invoices, receipts and reports
- CRM/Data modules: contacts, participants, abandoned checkouts, segments, ad audiences, UTM attribution and data quality

## Local Setup

```bash
npm install
npm run build
npm run start
```

The production server runs locally at:

```bash
http://localhost:3000
```

## Requirements

- Node.js `>=22.13.0`

## Notes For Deployment

This project currently uses `vinext` and Cloudflare-compatible build output. The local production build is verified with:

```bash
npm run build
```

For a public presentation URL, connect the repository to a hosting provider and use the existing build/start scripts unless the host requires a provider-specific adapter.
