# MusicSwipe – Tickets Frontend (PWA)

Ce document liste les tickets à créer (avec critères d’acceptation, endpoints et fichiers impactés) pour le frontend PWA, couvrant les fonctionnalités ajoutées et leur périmètre.

## Pré-requis
- `pwa`: `NEXT_PUBLIC_API_URL` pointant vers le backend.
- `backend`: clés Spotify valides (release date). Variables: `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, `SPOTIFY_REDIRECT_URI`.

## Sommaire des tickets

1) Page Music – Swipe + filtrage des titres déjà notés
2) BottomNav – Bouton précédent (au lieu du rating)
3) Page Home – Maquette, scroll horizontal, recherche
4) Recent Reviews – Avatars, notes et jaquettes réelles
5) Page Profil – Maquette, stats, histogramme, followers
6) Page Détail – Maquette, histogramme, release date, commentaires
7) Utilitaire CSS – Cacher les scrollbars (scroll conservé)
8) Types/Endpoints – `releaseDate` exposé dans `Track`

---

## 1) Page Music – Swipe + filtrage des titres notés

- Objectif: Sur la page `/music`, permettre le swipe gauche/droite pour naviguer dans les sons, et ne pas réafficher les titres déjà notés par l’utilisateur.
- Critères d’acceptation:
  - Swipe gauche → passe au son suivant; swipe droite → revient au son précédent.
  - Lorsqu’un utilisateur note un son, celui-ci disparaît de la liste courante et ne réapparaît pas dans la session.
  - Les rechargements successifs filtrent aussi les titres déjà notés.
- Endpoints:
  - `GET /users/me/recent-tracks?take=` – liste Spotify “recently played” (fallback sur `GET /tracks`).
  - `GET /ratings?userId=` – récupérer les titres déjà notés.
  - `POST /ratings` – enregistrer une note.
  - `GET /ratings/track/:id/average` – moyenne de notes.
- Fichiers impactés:
  - `pwa/src/app/(app)/music/page.tsx`
  - `pwa/src/components/track/SwipeCard.tsx`
  - `pwa/src/store/discover.ts` (exposition `prev`)

## 2) BottomNav – Bouton précédent

- Objectif: Remplacer le bouton “rating” de la seconde barre par un bouton “Précédent”.
- Critères d’acceptation:
  - Bouton “SkipBack” visible sur `/music` et opérationnel (appelle `prev`).
- Fichiers impactés:
  - `pwa/src/components/layout/BottomNav.tsx`
  - `pwa/src/store/discover.ts`

## 3) Page Home – Maquette, scroll horizontal, recherche

- Objectif: Refaire la page d’accueil comme la maquette fournie, avec bandeau “Popular this week” scrollable horizontalement et une barre de recherche fonctionnelle.
- Critères d’acceptation:
  - Header avec avatar + bulle “Qu’avez vous écoutés récemment ?”.
  - Section “Popular this week” en scroll horizontal, sans scrollbar visible.
  - Barre de recherche filtrant par titre/artiste; résultats listés dessous.
- Endpoints:
  - `GET /auth/me` – données utilisateur pour avatar/username.
  - `GET /users/me/recent-tracks` (fallback `GET /tracks`).
  - `GET /comments` – flux des commentaires (top 3).
- Fichiers impactés:
  - `pwa/src/app/(app)/home/page.tsx`
  - `pwa/src/components/ui/SearchBar.tsx`
  - `pwa/src/app/globals.css` (classe `.no-scrollbar`)

## 4) Recent Reviews – Avatars, notes et jaquettes réelles

- Objectif: Afficher dans “Recent Reviews” les vrais avatars, le pseudo, la jaquette du morceau et les étoiles correspondant à la note de l’auteur.
- Critères d’acceptation:
  - Chaque carte affiche l’avatar auteur, son pseudo, le titre du track, son commentaire, la jaquette et les étoiles (score 1..5).
- Endpoints:
  - `GET /comments` – commentaires récents.
  - `GET /tracks/:id` – info jaquette/titre.
  - `GET /users/:id` – pseudo + avatar.
  - `GET /ratings?userId=&trackId=` – score de la note.
- Fichiers impactés: `pwa/src/app/(app)/home/page.tsx`

## 5) Page Profil – Maquette, stats, histogramme, followers

- Objectif: Refaire la page `/account` comme la maquette avec avatar large, compteurs, activité récente (notes), histogramme de notes et followers.
- Critères d’acceptation:
  - Avatar large + bouton décoratif “+”.
  - Compteurs: Reviews, Ratings, Followers.
  - “Recent Activity”: horizontal, jaquettes cliquables vers `/tracks/:id`, étoiles par note.
  - “Ratings”: histogramme (1..5) + moyenne.
  - “Followers”: avatars + username (3 premiers).
- Endpoints:
  - `GET /auth/me`, `GET /follows/stats/:userId`, `GET /ratings?userId=`, `GET /comments?userId=`
  - `GET /follows/followers/:userId`
  - `GET /tracks/:id` (pour enrichir activity)
- Fichiers impactés: `pwa/src/app/(app)/account/page.tsx`

## 6) Page Détail – Maquette, histogramme, release date, commentaires

- Objectif: Refaire `/tracks/:id` selon la maquette; afficher histogramme de notes, moyenne, release date, et permettre de commenter.
- Critères d’acceptation:
  - Jaquette + titre + artiste + bloc d’étoiles (notation) fonctionnel.
  - Histogramme 1..5 calculé à partir de `GET /ratings?trackId=`; moyenne via `GET /ratings/track/:id/average`.
  - Release date affichée si connue.
  - Saisie + envoi de commentaires (requiert login), liste des commentaires dessous.
- Endpoints:
  - `GET /tracks/:id`
  - `GET /ratings?trackId=:id`, `GET /ratings/track/:id/average`, `POST /ratings`
  - `GET /comments?trackId=:id`, `POST /comments`
- Fichiers impactés: `pwa/src/app/(app)/tracks/[id]/page.tsx`

## 7) Utilitaire CSS – Cacher les scrollbars

- Objectif: Masquer visuellement les scrollbars tout en gardant le scroll.
- Implémentation: classe `.no-scrollbar` (Edge/IE, Firefox, WebKit) appliquée aux conteneurs `overflow-x-auto`.
- Fichier: `pwa/src/app/globals.css`

## 8) Types/Endpoints – Release date exposée

- Objectif: exposer `releaseDate` dans les réponses `Track` (via Spotify) et côté PWA.
- Backend:
  - `backend/src/auth/spotify.service.ts`: ajout client credentials + `getTrackReleaseDate()`.
  - `backend/src/tracks/tracks.service.ts`: enrichissement `findAll`/`findOne` avec `releaseDate`.
  - `backend/src/users/users.service.ts`: `getRecentTracks()` renvoie aussi `releaseDate`.
  - `backend/src/tracks/entities/track.entity.ts`: ajoute le champ optionnel `releaseDate`.
- Frontend:
  - `pwa/src/types/index.ts`: ajoute `releaseDate?: string | null`.
  - `pwa/src/app/(app)/tracks/[id]/page.tsx`: affichage de la date.

---

## Définition de Terminé (DoD)
- États de chargement/erreurs gérés (au minimum: message textuel).
- Navigation OK (liens `/tracks/:id`, retour, swipe, bottom nav).
- Données réelles branchées aux endpoints (avec token quand requis).
- Style cohérent avec la maquette (tailles/espaces principaux respectés).
- Accessibilité minimale: `aria-label` sur les actions principales.

## Idées / Suivi (tickets futurs)
- Bouton “+” sur avatar → upload avatar (page Settings / input direct).
- Swipe “like” sur Music (ex: swipe droite = like), feedback visuel du swipe.
- Formater `releaseDate` (ex: 2024-06-01 → 1 Jun 2024) côté UI.
- Pagination/infini pour commentaires et followers.
- Skeleton loaders sur Home/Profil/Detail.
