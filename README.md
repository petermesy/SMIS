# SMIS Backend (Node.js + Express + PostgreSQL)

This is the backend for the School Management Information System (SMIS).

## Features
- Node.js + Express.js API
- PostgreSQL with Prisma ORM
- JWT authentication (role-based)
- Multer file uploads
- Input validation & sanitization
- Security: CORS, helmet, rate limiting
- Swagger/OpenAPI documentation
- Logging (morgan, winston)
- Environment config (.env)
- Database migrations & seed data
- Unit tests (Jest)

## Getting Started

1. **Install dependencies:**
   ```sh
   npm install
   ```
2. **Configure environment:**
   - Copy `.env.example` to `.env` and fill in your settings.
3. **Setup database:**
   ```sh
   npx prisma migrate dev --name init
   npx prisma db seed
   ```
4. **Run the server:**
   ```sh
   npm run dev
   ```
5. **API Docs:**
   - Visit `/api/docs` for Swagger UI.

## Project Structure
- `src/` - Main source code
- `prisma/` - Prisma schema & migrations
- `.env` - Environment variables

## Testing
```sh
npm test
```

---
See the backend prompt for full requirements and API details.
