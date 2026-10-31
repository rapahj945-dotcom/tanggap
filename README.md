# TANGGAP

Public complaint platform (road damage, street lights, waste, flooding…). Rebuilt from
[Sistem-Informasi-Pengaduan-Masyarakat](https://github.com/ibnusab/Sistem-Informasi-Pengaduan-Masyarakat)
as a SvelteKit full-stack app on PostgreSQL. New name, new visual identity, no card components.

## Run with Docker

```bash
cp .env.example .env      # set POSTGRES_PASSWORD, ORIGIN, and TAMPILKAN_AKUN_CONTOH=false for production
docker compose up --build
```

Open http://localhost:3000. On first start the app creates the tables and loads sample data.

| Role | Email | Password |
|---|---|---|
| Administrator | admin@tanggap.id | admin123 |
| Field officer | ahmad@tanggap.id | petugas123 |
| Citizen | siti@contoh.id | warga123 |

> These accounts exist only in the sample seed. In a database where the team replaced the
> seed users, use those accounts instead (see Pengguna → Administrator once verified), and
> set `TAMPILKAN_AKUN_CONTOH=false` before going public.

## Run on Termux (Android)

No Docker in Termux; PostgreSQL runs natively. Everything is automated by one script:

```bash
pkg install bash -y
bash scripts/termux.sh
```

The script (idempotent, safe to re-run) installs nodejs-lts and postgresql, initializes the Postgres cluster at `$PREFIX/var/lib/postgres` (only once), starts it, creates the `tanggap` database, runs `npm install`, and starts the dev server. Open http://localhost:3000 — the schema and sample data are created automatically on first request. For later sessions, start Postgres again with `pg_ctl -D $PREFIX/var/lib/postgres start` (or just re-run the script).

## Run locally (without Docker for the app)

```bash
docker compose up -d db          # or any PostgreSQL 14+
export DATABASE_URL=postgres://tanggap:tanggap@localhost:5432/tanggap   # expose 5432 in compose if needed
npm install
npm run dev
```

## How it is built

- **Frontend**: SvelteKit 2 + Svelte 5, plain CSS tokens in `src/app.css`, Leaflet for maps. Fonts are self-hosted.
- **Backend**: SvelteKit server code (`+page.server.ts`, `+server.ts`) with `pg`. All SQL is parameterised.
- **Database**: `db/schema.sql` is applied on startup (idempotent). Sample data is inserted only when `users` is empty.
- **Auth**: bcrypt passwords, server-side sessions in PostgreSQL, httpOnly cookie. Every `/app/*` route requires login; each role is enforced again in the server load/action, not just the menu.
- **Uploads**: stored in `UPLOAD_DIR` (Docker volume `uploads`). Type is checked from file contents (JPG/PNG/WebP, max 5 MB), names are random UUIDs.
- **Backup**: `docker compose exec -T db pg_dump -U tanggap tanggap > backup.sql`

## Roles

- **Warga (citizen)**: create reports with photo and map pin, follow their own reports, rate finished ones.
- **Petugas (officer)**: sees only assigned tasks; moves status through Ditangani → Survei → Perbaikan → Selesai, records funds and an after-photo.
- **Administrator**: everything above for all reports, plus assignment, users, categories and regions.
- **Public**: `/lacak/<ticket number>` shows status, funds and the full history without login.

Status flow: Diterima → Diverifikasi → Ditangani → Survei → Perbaikan → Selesai (or Ditolak, with a required reason).

## Recent additions

- **In-app notifications** — the reporter is notified whenever a report's status changes or the officer is assigned Sidebar shows an unread counter, `/app/notifikasi` lists them with "mark all read" and single-item delete.
- **14-day SLA** — every open report shows "sisa X hari dari 14" on the detail page, the report list, and the dashboard queue (green → orange ≤5 days → red ≤2 days).
- **Rate limiting** — login 5 attempts / 10 minutes per IP, registration 3 / hour per IP, report creation 5 / day per user. In-memory (`src/lib/server/batas.ts`); restart of the app container resets it.
- **Unique ticket numbers** — concurrent submissions retry on `kode` conflicts instead of failing.
- **Status audit** — every `riwayat` row records `oleh_id` (who made the change), not just the display name.
- **Peta fix** — kecamatan relationship handling in the map filters was corrected.

## What changed from the original

| Original | TANGGAP |
|---|---|
| React + localStorage only (no real backend) | SvelteKit + PostgreSQL, real sessions and permissions |
| SIPEMAS, card-grid dashboard | TANGGAP, ledger-style dashboard: one headline, a figure strip, a work queue and a side rail separated by dashed lane markings |
| Passwords accepted from a hard-coded list | bcrypt hashes, generic login error |
| Photos as base64 in storage | Files on a volume, validated |
| PDF + Excel export | CSV export (opens in Excel/Sheets). PDF letter and QR code are not ported yet |

## Not included yet

- PDF complaint sheet and QR code per ticket
- Email/SMS notifications (in-app notifications are done)
- Address lookup from map coordinates (the pin and typed address are stored separately)
- Automated tests (the flows were checked manually against a real PostgreSQL 16)

## Repository layout

```
db/schema.sql              tables (applied idempotently on startup)
scripts/termux.sh          Android/Termux setup
src/lib/server/            auth.ts, db.ts, upload.ts, batas.ts (rate limits), beritahu.ts (notifications), akses.ts (role scope)
src/lib/components/        Merek (logo), Lajur (status ribbons), Peta (Leaflet), Tren (charts), Batang (bars)
src/routes/                +page.svelte (public), /app/* (application), /lacak/* (public tracking), /berkas/* (uploads)
docker-compose.yml         db (postgres:16-alpine) + app (adapter-node, port 3000)
```
