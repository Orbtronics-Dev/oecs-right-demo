# OECS RIGHT - Reference Implementation

**Orbtronics Ltd** is providing technical advisory and quality assurance services to the **Organisation of Eastern Caribbean States (OECS) Commission** under the 11th EDF Regional Integration, Growth and Human Development (RIGHT) Programme.

This repository is a reference implementation of the consumer protection platform being developed for four Member States: Antigua and Barbuda, Grenada, Saint Lucia, and Saint Vincent and the Grenadines.

- **Contract Reference:** OECS/RIGHT/2026/Ser_75
- **Live demo:** [oecs.orbtronics.co](https://oecs.orbtronics.co)

> **This is a demonstration only.** All data is sample data and resets on each server restart. It does not represent the production system for any Member State.

---

## What this demonstrates

The platform is a transactional web application for consumer affairs departments. The demo covers:

- **Public portal:** complaint submission, case tracking, price checker, and consumer updates
- **Officer portal:** case management, price control calculations, price surveillance, ASYCUDA integration log, audit trail, and settings
- **Role-based access:** six distinct roles with different levels of access across all modules

---

## Demo credentials

All accounts use the password `demo1234`.

| Username | Role | Access |
|---|---|---|
| `kwilliams` | Consumer Affairs Officer | Complaints, case management, price control, price surveillance |
| `rbaptiste` | Field Officer | Price surveillance and outlet management |
| `jthomas` | Senior Officer | All Officer access, plus MRP calculation certification |
| `mdirector` | Director | Full access, including final approvals, markup configuration, feature flags |
| `ccustoms` | Customs Officer | ASYCUDA data submission only |
| `oexecutive` | OECS Executive | Read-only reports and analytics |

Navigate to [oecs.orbtronics.co/officer-login](https://oecs.orbtronics.co/officer-login) to access the officer portal.

---

## Repository structure

```
oecs-right-demo/
├── app/                    # Next.js app router
│   ├── (public)/           # Public-facing pages (complaint form, price checker, updates)
│   ├── (officer)/          # Officer portal (dashboard, login)
│   └── api/                # Backend API routes
├── features/               # Feature modules (complaints, officer, prices, surveillance)
├── components/             # Shared UI components
├── data/
│   └── mockData.ts         # Sample data seed (complaints, prices, officers, calculations)
├── lib/
│   └── store.ts            # In-memory data store (initialised from mockData on startup)
├── providers/              # React context providers
├── public/                 # Static assets
├── Dockerfile              # Container image
└── example.env             # Environment variable reference
```

---

## Running locally

**Requirements:** Node.js 20+, pnpm

```sh
cp example.env .env.local
pnpm install
pnpm dev
```

The application starts at `http://localhost:3000`.

No database setup is required. The in-memory store is initialised from `data/mockData.ts` on startup and discarded when the server stops.

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router), React, TypeScript |
| Styling | Tailwind CSS |
| Component library | shadcn/ui |
| Data store | In-memory singleton (demo only; production uses PostgreSQL) |
| Authentication | Session cookie with role-based access control |
| Containerisation | Docker |

---

## Contact

**Orbtronics Ltd** · Gros Islet, Saint Lucia
[info@orbtronicsltd.com](mailto:info@orbtronicsltd.com) · +1 758 486 0469 · [orbtronics.co](https://orbtronics.co)
