# Le Léopard et les Ombres — Site de vente

Site de lancement et de vente pour le roman *Le Léopard et les Ombres* de **Koreen Mbombele**.
Vend l'ebook (EPUB + PDF) avec paiement Mobile Money, CinetPay et PayPal.

---

## Démarrage rapide

> **Prérequis** : Node.js 20+, npm 10+, une base PostgreSQL 15+ accessible.

### 1. Cloner et installer

```bash
git clone https://github.com/unique237/leopard_ombres.git
cd leopard_ombres
npm install
```

### 2. Configurer l'environnement

```bash
cp .env.example .env
```

Ouvrir `.env` et renseigner **deux variables obligatoires** :

```env
# Connexion PostgreSQL
# Exemple local :  postgresql://postgres:motdepasse@localhost:5432/leopard_db
# Exemple Render : fourni dans le dashboard du service PostgreSQL
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE

# Clé secrète pour les tokens JWT admin (chaîne aléatoire longue)
# Générer une clé sécurisée : openssl rand -base64 32
JWT_SECRET=changez-ce-secret
```

> Si vous utilisez PostgreSQL en local, créez d'abord la base :
> ```bash
> psql -U postgres -c "CREATE DATABASE leopard_db;"
> ```

### 3. Lancer le projet

```bash
npm run dev
```

C'est tout. Le serveur **crée automatiquement toutes les tables et les données de départ**
au premier démarrage (et vérifie à chaque redémarrage sans rien écraser).

| URL | Rôle |
|---|---|
| `http://localhost:5173` | Landing page publique |
| `http://localhost:5173/admin` | Panneau d'administration |
| `http://localhost:3001/api/health` | Santé de l'API |

---

## Migrations automatiques

Au démarrage, le serveur exécute `server/migrate.ts` qui applique 4 migrations
dans l'ordre, chacune tracée dans la table `_migrations` :

| Migration | Tables créées |
|---|---|
| `001_orders` | `orders` |
| `002_books_settings_visits` | `books`, `site_settings`, `page_visits` + données de départ |
| `003_order_stats` | `order_stats` + trigger de comptage |
| `004_comments_admin_auth` | `comments`, `admin_users` + fonctions SQL d'auth |

Une migration déjà appliquée n'est **jamais rejouée**.
Le dossier `supabase/migrations/` contient l'historique original Supabase — il n'est
plus utilisé pour la mise en place locale.

---

## Premier compte admin

Au premier accès à `/admin`, cliquez sur **"Premier accès"** pour créer le compte
administrateur. Un seul compte peut exister (protection intégrée).

Pour réinitialiser :

```bash
psql "$DATABASE_URL" -c "TRUNCATE admin_users;"
```

---

## Scripts disponibles

```bash
npm run dev           # Frontend (Vite) + Backend (Express) en parallèle
npm run server:dev    # Serveur Express seul avec rechargement automatique
npm run build         # Build de production (TypeScript + Vite → dist/)
npm run typecheck     # Vérification TypeScript sans compilation
npm run preview       # Prévisualiser le build de production
```

---

## Build de production (Render / VPS)

```bash
npm run build
NODE_ENV=production npm run server:start
```

Le serveur Express sert le frontend compilé (`dist/`) et toutes les routes API.
Le port est défini par la variable `PORT` (défaut : 3001).

---

## Stack technique

| Couche | Technologie |
|---|---|
| Frontend | React 19 + TypeScript + Vite |
| Style | Tailwind CSS v4 + shadcn/ui |
| Backend | Node.js + Express 5 |
| Base de données | PostgreSQL via `pg` (connexion directe) |
| Auth admin | JWT + bcrypt |
| Upload fichiers | multer → dossier `uploads/` |

---

## Structure du projet

```
.
├── server/
│   ├── index.ts          # Point d'entrée — lance les migrations puis écoute
│   ├── migrate.ts        # Runner de migrations automatiques
│   ├── db.ts             # Pool PostgreSQL (pg)
│   ├── auth.ts           # Génération/vérification JWT
│   ├── middleware/
│   │   └── auth.ts       # Middleware requireAdmin
│   └── routes/
│       ├── auth.ts       # POST /login, /register — GET /me
│       ├── orders.ts     # Commandes ebooks
│       ├── books.ts      # Catalogue
│       ├── comments.ts   # Témoignages lecteurs
│       ├── settings.ts   # Paramètres site (prix, paiements, contact)
│       ├── stats.ts      # Dashboard admin
│       ├── visits.ts     # Analytics
│       └── upload.ts     # Preuves de paiement
│
├── src/
│   ├── admin/            # Pages admin (dashboard, commandes, livres, etc.)
│   ├── components/
│   │   ├── sections/     # Sections de la landing page
│   │   └── ui/           # Composants shadcn/ui
│   ├── hooks/
│   ├── lib/
│   │   ├── api.ts        # Client API fetch
│   │   └── settings-context.tsx
│   └── main.tsx
│
├── public/               # Images statiques (couverture, portrait auteure)
├── uploads/              # Preuves de paiement uploadées (ignoré par git)
├── dist/                 # Build de production (généré)
├── .env.example          # Variables d'environnement requises
└── supabase/migrations/  # Historique SQL d'origine (référence uniquement)
```

---

## Routes API

Toutes préfixées `/api`.

### Auth
| Méthode | Route | Auth | Description |
|---|---|---|---|
| POST | `/auth/login` | — | Connexion admin |
| POST | `/auth/register` | — | Créer le premier compte admin |
| GET | `/auth/me` | JWT | Infos du compte connecté |

### Commandes
| Méthode | Route | Auth | Description |
|---|---|---|---|
| POST | `/orders` | — | Nouvelle commande ebook |
| POST | `/upload` | — | Joindre une preuve de paiement |
| GET | `/orders/admin` | JWT | Lister toutes les commandes |
| PATCH | `/orders/admin/:id/status` | JWT | Changer le statut |

### Livres
| Méthode | Route | Auth | Description |
|---|---|---|---|
| GET | `/books` | — | Livres publiés |
| GET | `/books/admin` | JWT | Tous les livres |
| POST | `/books/admin` | JWT | Créer |
| PUT | `/books/admin/:id` | JWT | Modifier |
| DELETE | `/books/admin/:id` | JWT | Supprimer |

### Paramètres
| Méthode | Route | Auth | Description |
|---|---|---|---|
| GET | `/settings` | — | Tous les paramètres (prix, contact, paiements) |
| PUT | `/settings/:key` | JWT | Mettre à jour une clé |

### Autres
| Méthode | Route | Auth | Description |
|---|---|---|---|
| GET | `/comments` | — | Témoignages publiés |
| GET | `/admin/stats` | JWT | Stats dashboard |
| POST | `/visits` | — | Enregistrer une visite |
| GET | `/health` | — | Santé du serveur |

---

## Dépannage

**Le serveur refuse de démarrer**
→ Vérifier que `DATABASE_URL` et `JWT_SECRET` sont bien définis dans `.env`.

**Erreur de connexion à la base**
```bash
psql "$DATABASE_URL" -c "SELECT 1;"
```
Si ça échoue, vérifier l'URL, le mot de passe et que PostgreSQL est démarré.

**"An admin account already exists"**
→ Un compte est déjà créé. Utiliser l'onglet "Connexion", ou réinitialiser :
```bash
psql "$DATABASE_URL" -c "TRUNCATE admin_users;"
```

**Changer le port Express (défaut 3001)**
Dans `.env` :
```env
PORT=3002
```
Et dans `vite.config.ts`, mettre le même port dans le proxy.

**Générer une clé JWT sécurisée**
```bash
openssl rand -base64 32
```
