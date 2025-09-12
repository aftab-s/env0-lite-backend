# Backend for Terraform OSS UI Tool

## Stack
- Node.js (Express)
- PostgreSQL (Prisma ORM)
- JWT Auth

## Setup
1. `npm install`
2. Copy `.env.example` to `.env` and fill in values
3. `npx prisma migrate dev`
4. `npm start`

## Main files
- `src/index.js` — Express app
- `prisma/schema.prisma` — DB schema

---

See root README for project overview.
