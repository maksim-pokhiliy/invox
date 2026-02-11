# Contributing to GetPaid

Thanks for your interest in contributing! Here's how to get started.

## Development Setup

1. **Clone the repo**
   ```bash
   git clone https://github.com/maksim-pokhiliy/getpaid.git
   cd getpaid
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up the database**
   ```bash
   cp .env.example .env
   # Edit .env with your PostgreSQL connection string
   pnpm db:migrate
   pnpm db:seed  # Optional: loads demo data
   ```

4. **Start the dev server**
   ```bash
   pnpm dev
   ```

## Project Structure

This project follows **Feature-Sliced Design (FSD)** architecture. See [CLAUDE.md](./CLAUDE.md) for detailed architecture rules.

Key directories:
- `src/app/` — Next.js routing only (no components)
- `src/features/` — Domain-specific feature slices
- `src/shared/` — Shared utilities, UI components, config
- `src/server/` — Server-side services (Prisma access)
- `prisma/` — Database schema and migrations

## Code Style

- **TypeScript** strict mode
- **kebab-case** for all file names
- **MUI** for all UI components
- **Zod** for all validation schemas
- No code comments (code should be self-documenting)

Run checks before submitting:
```bash
pnpm lint
pnpm typecheck
pnpm format:check
```

## Pull Requests

1. Fork the repo and create a branch from `master`
2. Make your changes
3. Ensure lint and typecheck pass
4. Submit a PR with a clear description of the change

## Reporting Issues

Use [GitHub Issues](https://github.com/maksim-pokhiliy/getpaid/issues) to report bugs or suggest features. Include steps to reproduce for bugs.
