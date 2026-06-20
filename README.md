# Le Léopard et les Ombres — Site de vente du livre

Site de lancement et de vente pour le roman *Le Léopard et les Ombres* de Koreen Mbombele.

## Stack technique

| Couche | Technologie |
|---|---|
| Frontend | React 19 + TypeScript + Vite |
| Style | Tailwind CSS v4 + shadcn/ui (new-york) |
| Backend | Node.js + Express 5 |
| Base de données | PostgreSQL (via `pg`) ou Supabase PostgREST |
| Auth admin | JWT (jsonwebtoken) + bcrypt |
| Upload fichiers | multer → dossier `uploads/` local |

---

## Prérequis

- **Node.js 20+** — `node --version`
- **npm 10+** — `npm --version`
- **PostgreSQL 15+** installé et démarré — `psql --version`

---

## Installation depuis zéro

### 1. Cloner et installer les dépendances

```bash
git clone <url-du-depot>
cd leopard-et-les-ombres
npm install
```

### 2. Créer la base de données PostgreSQL

```bash
# Ouvrir psql en tant que superutilisateur
psql -U postgres

# Dans psql :
CREATE DATABASE leopard_db;
CREATE USER leopard_user WITH PASSWORD 'votre_mot_de_passe';
GRANT ALL PRIVILEGES ON DATABASE leopard_db TO leopard_user;
\q
```

### 3. Configurer les variables d'environnement

Copier `.env` et remplir les valeurs :

```bash
cp .env .env.local
```

Modifier `.env` (ou `.env.local`) :

```env
# PostgreSQL — URL de connexion directe
# Format : postgresql://utilisateur:mot_de_passe@hote:port/nom_base
DATABASE_URL=postgresql://leopard_user:votre_mot_de_passe@localhost:5432/leopard_db

# Clé secrète JWT pour les sessions admin
# Changer absolument en production (chaîne aléatoire longue)
JWT_SECRET=changez-ce-secret-en-production-utilisez-openssl-rand-base64-32

# Port du serveur Express (optionnel, défaut : 3001)
PORT=3001

# Supabase (optionnel si DATABASE_URL est défini — utilisé uniquement comme fallback)
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

> **Note :** Si `DATABASE_URL` est défini, le backend utilise votre PostgreSQL local directement.
> Si `DATABASE_URL` est vide, il bascule automatiquement sur l'API PostgREST de Supabase
> (les variables `VITE_SUPABASE_*` doivent alors être renseignées).

### 4. Créer le schéma de la base de données

Appliquer les migrations dans l'ordre chronologique :

```bash
psql -U leopard_user -d leopard_db -f supabase/migrations/20260619223430_create_orders_table.sql
psql -U leopard_user -d leopard_db -f supabase/migrations/20260619230743_tighten_orders_rls.sql
psql -U leopard_user -d leopard_db -f supabase/migrations/20260619231146_replace_security_definer_with_counter_table.sql
psql -U leopard_user -d leopard_db -f supabase/migrations/20260619234520_create_admin_dashboard_schema.sql
psql -U leopard_user -d leopard_db -f supabase/migrations/20260620124932_fix_orders_policies_and_comments_table.sql
```

> **Alternative — commande unique :**
>
> ```bash
> for f in supabase/migrations/*.sql; do
>   echo "Applying $f..."
>   psql -U leopard_user -d leopard_db -f "$f"
> done
> ```

Si vous avez un PostgreSQL sans extension `pg_crypto`, activez-la d'abord :

```bash
psql -U postgres -d leopard_db -c "CREATE EXTENSION IF NOT EXISTS pgcrypto;"
```

### 5. Démarrer en développement

```bash
npm run dev
```

Cette commande lance **en parallèle** :
- Le serveur Vite (frontend) sur `http://localhost:5173`
- Le serveur Express (API) sur `http://localhost:3001`

Le proxy Vite redirige automatiquement `/api/*` et `/uploads/*` vers le serveur Express.

---

## Schéma de la base de données

### Table `orders`

Commandes passées depuis la landing page.

| Colonne | Type | Description |
|---|---|---|
| `id` | uuid PK | Généré côté client |
| `format` | text | `'physical'` ou `'digital'` |
| `email` | text | Email du client |
| `first_name` | text | Prénom |
| `phone` | text\|null | Téléphone (requis pour physique) |
| `city` | text\|null | Ville de livraison |
| `address` | text\|null | Adresse de livraison |
| `delivery_method` | text\|null | `'home'` ou `'pickup'` |
| `payment_method` | text | `'mtn'`, `'orange'`, `'cinetpay'` ou `'paypal'` |
| `payment_proof_url` | text\|null | URL de la capture de paiement |
| `amount` | integer | Montant en FCFA |
| `status` | text | `'pending'` → `'verifying'` → `'confirmed'` → `'delivered'` |
| `created_at` | timestamptz | Horodatage |

### Table `comments`

Témoignages de lecteurs gérés manuellement depuis l'admin.

| Colonne | Type | Description |
|---|---|---|
| `id` | uuid PK | |
| `author_name` | text | Nom affiché |
| `comment` | text | Texte du témoignage |
| `is_published` | boolean | `true` = visible sur la landing page |
| `created_at` | timestamptz | |

### Table `books`

Catalogue des livres.

| Colonne | Type | Description |
|---|---|---|
| `id` | uuid PK | |
| `title` | text | |
| `subtitle` | text\|null | |
| `tagline` | text\|null | Phrase d'accroche |
| `author` | text | |
| `description` | text\|null | |
| `cover_url` | text\|null | Chemin ou URL de la couverture |
| `price_promo` | integer | Prix de lancement (FCFA) |
| `price_full` | integer | Prix normal (FCFA) |
| `currency` | text | Devise (ex. `'FCFA'`) |
| `status` | text | `'draft'`, `'published'` ou `'archived'` |
| `featured` | boolean | Mis en avant sur la landing page (un seul à la fois) |
| `release_date` | date\|null | |
| `created_at` / `updated_at` | timestamptz | |

### Table `site_settings`

Configuration du site stockée en JSON.

| Colonne | Type | Description |
|---|---|---|
| `key` | text PK | `'promo'`, `'contact'`, `'payments'`, `'bank'` |
| `value` | jsonb | Objet de configuration |
| `updated_at` | timestamptz | |

### Table `page_visits`

Analytics de visites (compteur simple, pas de données personnelles).

| Colonne | Type | Description |
|---|---|---|
| `id` | uuid PK | |
| `path` | text | Chemin visité (ex. `'/'`) |
| `visitor_id` | text | UUID anonyme stocké dans localStorage |
| `user_agent` | text | User-agent tronqué à 500 caractères |
| `referrer` | text | Referrer tronqué à 500 caractères |
| `created_at` | timestamptz | |

### Table `admin_users`

Comptes administrateurs. Inaccessible directement via RLS — exposée uniquement via des fonctions `SECURITY DEFINER`.

| Colonne | Type | Description |
|---|---|---|
| `id` | uuid PK | |
| `email` | text UNIQUE | Email de connexion |
| `password_hash` | text | Hash bcrypt du mot de passe |
| `created_at` | timestamptz | |

---

## Authentification admin

Le premier compte créé via `/admin` (onglet "Premier accès") devient administrateur. Un seul compte peut exister (protection intégrée dans la fonction PostgreSQL `admin_register_user`).

- Les sessions durent **7 jours** (token JWT stocké dans `localStorage` sous la clé `admin_token`).
- Pour réinitialiser un compte : supprimer la ligne dans la table `admin_users`.

```bash
psql -U leopard_user -d leopard_db -c "TRUNCATE admin_users;"
```

---

## Routes API

Toutes les routes sont préfixées `/api`.

### Auth

| Méthode | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/login` | Non | Connexion admin |
| POST | `/api/auth/register` | Non | Création du premier compte admin |
| GET | `/api/auth/me` | JWT | Infos du compte connecté |

### Commandes

| Méthode | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/orders` | Non | Créer une commande (depuis la landing page) |
| POST | `/api/upload` | Non | Joindre une preuve de paiement |
| GET | `/api/orders/admin` | JWT | Lister toutes les commandes |
| PATCH | `/api/orders/admin/:id/status` | JWT | Changer le statut d'une commande |

### Livres

| Méthode | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/books` | Non | Livres publiés (landing page) |
| GET | `/api/books/admin` | JWT | Tous les livres |
| POST | `/api/books/admin` | JWT | Créer un livre |
| PUT | `/api/books/admin/:id` | JWT | Modifier un livre |
| DELETE | `/api/books/admin/:id` | JWT | Supprimer un livre |

### Témoignages

| Méthode | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/comments` | Non | Commentaires publiés |
| GET | `/api/comments/admin` | JWT | Tous les commentaires |
| POST | `/api/comments/admin` | JWT | Créer un commentaire |
| PUT | `/api/comments/admin/:id` | JWT | Modifier un commentaire |
| DELETE | `/api/comments/admin/:id` | JWT | Supprimer un commentaire |

### Paramètres

| Méthode | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/settings` | Non | Tous les paramètres |
| PUT | `/api/settings/:key` | JWT | Mettre à jour une clé de paramètres |

### Statistiques & visites

| Méthode | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/admin/stats` | JWT | Tableau de bord (visites, commandes, revenus) |
| POST | `/api/visits` | Non | Enregistrer une visite de page |

---

## Scripts disponibles

```bash
# Développement (Vite + Express en parallèle)
npm run dev

# Serveur Express seul (sans rechargement automatique)
npm run server:start

# Serveur Express avec rechargement automatique
npm run server:dev

# Build de production (TypeScript + Vite)
npm run build

# Vérification TypeScript sans compilation
npm run typecheck

# Prévisualiser le build de production
npm run preview
```

---

## Build de production

```bash
npm run build
```

Le dossier `dist/` contient le frontend compilé. En production, le serveur Express sert ce dossier directement :

```bash
NODE_ENV=production npm run server:start
```

Le serveur écoute sur le port défini par `PORT` (défaut : 3001) et sert :
- `/api/*` → routes Express
- `/uploads/*` → fichiers uploadés
- Tout le reste → `dist/index.html` (SPA fallback)

---

## Structure du projet

```
.
├── server/                     # Backend Express (Node.js)
│   ├── index.ts                # Point d'entrée du serveur
│   ├── auth.ts                 # Génération/vérification JWT
│   ├── db.ts                   # Abstraction DB (pg ou Supabase PostgREST)
│   ├── middleware/
│   │   └── auth.ts             # Middleware JWT (requireAdmin)
│   └── routes/
│       ├── auth.ts             # /api/auth/*
│       ├── orders.ts           # /api/orders/*
│       ├── books.ts            # /api/books/*
│       ├── comments.ts         # /api/comments/*
│       ├── settings.ts         # /api/settings/*
│       ├── stats.ts            # /api/admin/stats
│       ├── visits.ts           # /api/visits
│       └── upload.ts           # /api/upload
│
├── src/                        # Frontend React
│   ├── admin/                  # Pages admin (dashboard, orders, books, comments, settings)
│   ├── components/
│   │   ├── sections/           # Sections de la landing page
│   │   └── ui/                 # Composants shadcn/ui
│   ├── hooks/                  # Hooks React
│   ├── lib/
│   │   ├── api.ts              # Client API (remplace @supabase/supabase-js)
│   │   ├── auth-context.tsx    # Contexte d'authentification admin
│   │   └── settings-context.tsx# Contexte de paramètres en direct
│   └── main.tsx                # Routes React Router
│
├── supabase/migrations/        # Migrations SQL (ordre chronologique)
├── uploads/                    # Preuves de paiement uploadées
├── public/                     # Fichiers statiques (couverture, portrait)
└── dist/                       # Build de production (généré par npm run build)
```

---

## Dépannage

### "relation does not exist"

Les migrations n'ont pas été appliquées. Relancer la section [Créer le schéma](#4-créer-le-schéma-de-la-base-de-données) ci-dessus.

### "password authentication failed"

Vérifier les credentials dans `DATABASE_URL`. Tester avec :

```bash
psql "postgresql://leopard_user:votre_mot_de_passe@localhost:5432/leopard_db" -c "SELECT 1;"
```

### Le serveur Express ne démarre pas sur le port 3001

Changer le port dans `.env` :

```env
PORT=3002
```

Le proxy Vite doit pointer vers le même port — modifier `vite.config.ts` :

```ts
proxy: {
  "/api": { target: "http://localhost:3002" },
  "/uploads": { target: "http://localhost:3002" },
}
```

### "JWT_SECRET is not set" au démarrage

Ajouter `JWT_SECRET` dans `.env`. Pour générer une clé sécurisée :

```bash
openssl rand -base64 32
```

### Impossible de créer un compte admin ("An admin account already exists")

Un compte existe déjà dans `admin_users`. Utilisez l'onglet "Connexion" avec les credentials existants, ou réinitialisez :

```bash
psql -U leopard_user -d leopard_db -c "TRUNCATE admin_users;"
```

### Les uploads de preuves de paiement échouent

Vérifier que le dossier `uploads/` existe à la racine du projet et est accessible en écriture :

```bash
mkdir -p uploads
chmod 755 uploads
```
