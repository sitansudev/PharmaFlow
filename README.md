# PharmaFlow

[![Backend CI](https://github.com/sitansudev/PharmaFlow/actions/workflows/backend.yml/badge.svg?branch=main)](https://github.com/sitansudev/PharmaFlow/actions/workflows/backend.yml)

> Pharmacy Management System for real-world pharmacy operations.

PharmaFlow is a full-stack pharmacy management system designed to simplify
day-to-day pharmacy operations through a modern web application and Windows
desktop application.

## Features

- Medicine and inventory management
- Sales management
- Purchase management
- Supplier management
- Supplier ledger and payment tracking
- Customer management
- Dashboard and business insights
- Authentication and authorization
- PostgreSQL database with Prisma ORM
- Windows desktop application powered by Electron
- Automated backend testing
- GitHub Actions continuous integration

## Tech Stack

### Frontend

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui
- TanStack React Query
- React Hook Form
- Axios
- Zod

### Backend

- Node.js
- Express 5
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT
- bcrypt
- Zod
- Helmet
- Express Rate Limit
- Winston
- Swagger

### Desktop

- Electron
- electron-builder

### Tooling

- pnpm
- Turborepo
- Vitest
- ESLint
- Prettier
- GitHub Actions

## Architecture

PharmaFlow is organized as a pnpm workspace managed with Turborepo.

```text
PharmaFlow/
├── apps/
│   ├── backend/          # Express API and Prisma database
│   │   ├── prisma/       # Prisma schema and migrations
│   │   └── src/          # Backend source code
│   │
│   ├── web/              # Next.js web application
│   ├── desktop/          # Desktop application workspace
│   ├── docs/             # Documentation application
│   └── app/              # Application workspace
│
├── packages/             # Shared workspace packages
├── desktop/              # Electron desktop entry point
├── tools/                # Development utilities
├── launcher/             # Local development launcher
├── .github/
│   └── workflows/        # GitHub Actions workflows
│
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
└── README.md