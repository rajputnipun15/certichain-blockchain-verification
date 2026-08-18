# CertiChain Production Deployment Guide

This guide provides instructions for deploying CertiChain to production.

## 1. Architecture Overview

- **Frontend**: Static React bundle (Vite) hosted on Vercel, Netlify, or Cloudflare Pages.
- **Backend API**: Node.js + Express application deployed on Render, AWS EC2, DigitalOcean, or Railway.
- **Database**: Managed PostgreSQL database (Neon, Supabase, AWS RDS, or Render Postgres).

## 2. Docker Deployment

Deploy the full stack container environment using Docker Compose:

```bash
# Clone repository
git clone https://github.com/your-username/certichain.git
cd certichain

# Configure environment variables
cp server/.env.example server/.env

# Build & launch containers
docker compose up -d --build
```

Access the application at `http://localhost:5000`.

## 3. Database Migration (Production PostgreSQL)

When connecting to production PostgreSQL, update `server/.env`:

```env
DATABASE_URL="postgresql://user:password@db-host:5432/certichain?schema=public"
```

Run migrations and seed:

```bash
cd server
npx prisma db push
npx tsx prisma/seed.ts
```
