# 🎵 MusicSwipe

MusicSwipe est une application full-stack qui permet de découvrir, écouter et gérer des morceaux de musique grâce à une expérience interactive de type **swipe** (inspirée des apps de rencontre).  
Le projet inclut :  
- un **backend REST API** (NestJS + PostgreSQL/Prisma)  
- un **dashboard admin** (Refine + Next.js + Tailwind)  
- une **PWA** (Next.js) pour l’utilisateur final  
- une intégration à l’API Spotify pour l’authentification et la récupération des morceaux.  

---

## 🚀 Fonctionnalités principales

### Côté utilisateur (PWA)
- Authentification via compte ou Spotify  
- Swipe gauche/droite sur les morceaux pour découvrir de la musique  
- Accéder au détail d’un morceau (titre, artiste, album, preview Spotify)  
- Gestion du profil + statistiques personnelles  
- Historique des morceaux récemment écoutés  
- Recherche et suivi d’autres utilisateurs  

### Côté administrateur (Dashboard Refine)
- Dashboard principal avec statistiques globales  
- Gestion des utilisateurs (CRUD)  
- Gestion des morceaux (CRUD)  
- Paramètres et configuration  
- Sécurisation via authentification et autorisations  

### Backend (API REST)
- Authentification classique + Spotify OAuth2  
- Gestion des utilisateurs, morceaux et relations (suivi)  
- Intégration PostgreSQL via Prisma ORM  
- Documentation automatique avec **Swagger**  
- Sécurité renforcée : DTOs, Bcrypt pour le hashing, validations strictes  

---

## 🏗️ Architecture

```bash
.
├── backend/         # API NestJS + PostgreSQL/Prisma
│   ├── src/
│   ├── prisma/
│   └── swagger/
├── admin/           # Dashboard Refine (Next.js + Tailwind)
│   └── src/
└── pwa/             # Progressive Web App Next.js
    └── src/
```

---

## 📚 Technologies utilisées

- **Backend** : NestJS, TypeScript, Prisma, PostgreSQL, Swagger, Bcrypt  
- **Frontend Admin** : Next.js, Refine, Tailwind CSS  
- **PWA** : Next.js, React, Tailwind CSS, intégration Spotify  
- **Outils** : ESLint, Prettier, Docker & Docker Compose  

---

## 📡 API Endpoints (extraits)

### Auth
```
POST   /auth/login
GET    /auth/me
GET    /auth/spotify/auth-url
POST   /auth/spotify/auth
POST   /auth/spotify/link
POST   /auth/spotify/unlink
```

### Users
```
POST   /users
GET    /users
GET    /users/{id}
PATCH  /users/{id}
DELETE /users/{id}
GET    /users/me/recent-tracks
```

### Tracks
```
POST   /tracks
GET    /tracks
GET    /tracks/{id}
PATCH  /tracks/{id}
DELETE /tracks/{id}
```

### Follows
```
POST   /follows
DELETE /follows/{userId}
```

---

## ⚙️ Installation & Lancement

### Prérequis
- Node.js >= 18  
- Docker & Docker Compose  
- PostgreSQL (si pas via Docker)  

### Étapes

1. **Cloner le projet**
```bash
git clone https://github.com/HugoGarrigues/MusicSwipe.git
cd MusicSwipe
```

2. **Configurer les variables d’environnement**
```bash
cp .env.example .env
```

3. **Lancer avec Docker Compose**
```bash
docker-compose up --build
```

4. **Accéder aux services**
- Backend API : http://localhost:3000  
- Swagger Docs : http://localhost:3000/api  
- Admin Dashboard : http://localhost:3001  
- PWA : http://localhost:3002  

---

## 🧪 Tests & Qualité

- Tests unitaires intégrés côté backend (NestJS + Jest)  
- Validation du code via ESLint et Prettier  
- Plans de tests fonctionnels préparés pour la soutenance RNCP CDA  

---

## 📖 Contexte RNCP CDA

Ce projet a été développé dans le cadre du **Titre Professionnel RNCP 37873 – Concepteur Développeur d’Applications**.  
Il met en pratique les compétences évaluées :  
- Développement d’applications sécurisées (interfaces + composants métiers)  
- Conception et mise en place de bases de données relationnelles  
- Architecture multicouche sécurisée  
- Préparation au déploiement et plans de tests  
- Contribution à la mise en production (démarche DevOps)  

---

## 🛠️ Difficultés rencontrées

- Mise en place de l’OAuth2 Spotify (gestion des tokens & refresh)  
- Gestion des relations complexes dans Prisma (users ↔ tracks ↔ follows)  
- Déploiement Docker multi-services  
- Sécurisation des endpoints (JWT, guards NestJS)  
- Adaptation du design pour PWA et responsive  

---

## 🔮 Perspectives d’évolution

- Ajout de fonctionnalités sociales (commentaires, likes)  
- Recommandations musicales personnalisées (IA)  
- Intégration CI/CD complète pour le déploiement  
- Passage en production sur serveur dédié (homelab)  

---

## 📄 Licence

Projet académique développé dans le cadre du Titre Professionnel **CDA – Concepteur Développeur d’Applications**.  
Usage libre à but pédagogique.  

---

👉 [Lien vers le dépôt GitHub](https://github.com/HugoGarrigues/MusicSwipe)
