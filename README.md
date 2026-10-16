# Shivam Transport Carrier — Transport Bill Generator

A mobile-friendly React and Vite frontend demo for creating, previewing, saving, printing, and downloading transport bills based on the supplied paper format.

## Run locally

```bash
npm install
npm run dev
```

The demo stores bills, the current draft, company settings, bill numbering, vehicle suggestions, and route suggestions in the current browser's localStorage. This is not cloud storage and does not sync between devices or browsers.

## Extending to MERN

The storage functions in `src/lib/bills.ts` are intentionally isolated from the screens. They can be replaced with calls to an Express REST service without changing the form or preview. A future service can persist the same JSON-friendly `Bill` and `CompanyDetails` shapes in MongoDB, add authentication, and move bill numbering to a server-side atomic counter. PDF generation can remain client-side or move to a server if consistent archival files are required.
