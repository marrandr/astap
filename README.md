# Astap / Hamarino

Plateforme de fact-checking pour journalistes (Madagascar) : publication d'articles,
vérifications communautaires (confirmé / contesté), preuves attachées, comptes
validés par un administrateur.

## Stack

| Couche    | Tech                                                        |
|-----------|-------------------------------------------------------------|
| Backend   | NestJS 12, Prisma 7, PostgreSQL, passport-jwt, Cloudinary   |
| Frontend  | React 19, Vite, react-router 7                              |
| Infra     | docker-compose (postgres + backend + frontend)              |

## Structure

```
backend/    API NestJS (src/modules/*), schéma Prisma (prisma/)
frontend/   SPA React (src/components/*), client API (src/lib/api.ts)
docker-compose.yml
```

## Démarrage rapide (Docker)

```bash
cp backend/.env.example backend/.env   # renseigner JWT_SECRET, Cloudinary, SMTP...
docker compose up --build
```

- Frontend : http://localhost:5174
- Backend  : http://localhost:3001 (Swagger : http://localhost:3001/api hors prod)
- Postgres : localhost:5432

## Démarrage manuel

```bash
# 1. Base de données (ou utiliser le service postgres de compose)
docker compose up -d postgres

# 2. Backend
cd backend
cp .env.example .env                   # renseigner les variables
npm ci
npx prisma migrate deploy
npx prisma generate
npm run start:dev                      # http://localhost:3001

# 3. Frontend
cd ../frontend
npm ci
echo 'VITE_API_BASE_URL=http://localhost:3001' > .env
npm run dev                            # http://localhost:5173
```

## Comptes et rôles

- Inscription (`POST /auth/register`) avec pièce d'identité recto/verso → code de
  vérification envoyé par email (6 chiffres, 10 min, 5 tentatives max).
- Après vérification email, le compte reste `PENDING` : un administrateur doit le
  valider via `PATCH /admin/validate` avant qu'il puisse publier.
- **Bootstrap du premier administrateur** : tant qu'aucun compte `ADMIN` n'existe,
  `POST /admin/create-admin` est ouvert. Ensuite, cet endpoint exige un JWT admin.
- Les pièces d'identité ne sont accessibles qu'à leur propriétaire ou aux
  administrateurs (`GET /user/:id/proofs`).

## Scripts

### backend
```bash
npm run build        # nest build
npm run start:dev    # watch
npm run test         # vitest (unitaires)
npm run test:e2e     # vitest (e2e, sans base réelle requise)
npm run prisma:migrate / prisma:deploy / prisma:studio
```

### frontend
```bash
npm run dev          # vite
npm run build        # tsc -b && vite build
```

## API (extraits)

| Méthode | Route                    | Accès                  |
|---------|--------------------------|------------------------|
| POST    | /auth/register           | public (multipart)     |
| POST    | /auth/login              | public (email vérifié) |
| POST    | /auth/verify-email       | public                 |
| POST    | /auth/resend-verification| public (cooldown 1 min)|
| GET     | /article                 | JWT (paginé)           |
| POST    | /article                 | JWT + compte validé    |
| POST    | /article/verify          | JWT + compte validé    |
| POST    | /article/evidence        | JWT + compte validé    |
| PATCH   | /admin/validate          | JWT + rôle ADMIN       |
| POST    | /admin/create-admin      | bootstrap puis ADMIN   |
| GET     | /user/:id/proofs         | propriétaire ou ADMIN  |
| GET     | /health                  | public                 |

## Sécurité — points clés

- Validation stricte des DTOs (`whitelist` + `forbidNonWhitelisted`).
- Mots de passe bcrypt(10), code email hashé (SHA-256 lié à l'utilisateur) +
  comparaison à temps constant, 5 tentatives puis code invalidé.
- JWT exigé pour toutes les routes métier ; rôles vérifiés côté serveur ;
  comptes refusés/non vérifiés rejetés au niveau de la stratégie JWT.
- Rate limiting global (120 req/min, ajustable via `THROTTLE_*`) + limites
  renforcées sur `/auth/*` (5–10 req/min).
- Helmet, CORS restreint à `CORS_ORIGIN`, Swagger désactivé en production
  (sauf `SWAGGER_ENABLED=true`).
- Vérification des magic bytes des images (JPEG/PNG), upload 5 Mo max.

## Notes

- Le gestionnaire de paquets est **npm** (locks `package-lock.json`) ; les
  artefacts pnpm sont exclus.
- Le client Prisma est généré dans `backend/src/generated` (ignoré par git) :
  relancer `npx prisma generate` après chaque `npm ci`.
