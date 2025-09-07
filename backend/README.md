# MusicSwipe API — Endpoints

Ce document liste les endpoints exposés par l’API NestJS du dossier `backend`.

- Base URL par défaut: `http://localhost:3000`
- Authentification: JWT Bearer pour les routes protégées
- Documentation Swagger: `http://localhost:3000/api`

## Auth (`/auth`)

- POST `/auth/login`
  - Public
  - Corps: `{ email: string, password: string }`
  - Retourne le token et l’utilisateur (AuthEntity)

- GET `/auth/me`
  - Protégé (Bearer JWT)
  - Retourne l’identité de l’utilisateur connecté

- GET `/auth/spotify/auth-url`
  - Public
  - Génère l’URL d’autorisation Spotify

- POST `/auth/spotify/auth`
  - Public
  - Corps: `{ code: string }` (voir `SpotifyAuthDto`)
  - Authentifie via Spotify (crée ou connecte un compte)

- GET `/auth/spotify/link-url`
  - Protégé (Bearer JWT)
  - Génère l’URL pour lier un compte Spotify

- POST `/auth/spotify/link`
  - Protégé (Bearer JWT)
  - Corps: `{ code: string }` (voir `SpotifyLinkDto`)
  - Lie le compte Spotify à l’utilisateur connecté

- POST `/auth/spotify/unlink`
  - Protégé (Bearer JWT)
  - Délie le compte Spotify de l’utilisateur connecté

## Users (`/users`)

- POST `/users`
  - Public
  - Crée un utilisateur (CreateUserDto)

- GET `/users`
  - Protégé (Bearer JWT)
  - Liste des utilisateurs (UserEntity[])

- GET `/users/:id`
  - Protégé (Bearer JWT)
  - Récupère un utilisateur par id (UserEntity)

- PATCH `/users/:id`
  - Protégé (Bearer JWT)
  - Met à jour un utilisateur (UpdateUserDto)

- DELETE `/users/:id`
  - Protégé (Bearer JWT)
  - Supprime un utilisateur

- GET `/users/me/recent-tracks?take=<number>`
  - Protégé (Bearer JWT)
  - Renvoie les pistes récemment écoutées, `take` (optionnel, max 100, défaut 10)

## Tracks (`/tracks`)

- POST `/tracks`
  - Public
  - Crée une piste (CreateTrackDto)

- GET `/tracks`
  - Public
  - Liste toutes les pistes (TrackEntity[])

- GET `/tracks/:id`
  - Public
  - Détail d’une piste par id (TrackEntity)

- PATCH `/tracks/:id`
  - Public
  - Met à jour une piste (UpdateTrackDto)

- DELETE `/tracks/:id`
  - Public
  - Supprime une piste

## Likes (`/likes`)

- POST `/likes`
  - Protégé (Bearer JWT)
  - Corps: `{ trackId: number }`
  - Like une piste (LikeEntity)

- DELETE `/likes/track/:trackId`
  - Protégé (Bearer JWT)
  - Retire le like sur la piste

- GET `/likes`
  - Protégé (Bearer JWT)
  - Liste des likes de l’utilisateur (LikeEntity[])

- GET `/likes/track/:trackId`
  - Protégé (Bearer JWT)
  - Retourne l’état du like pour une piste: `{ trackId, liked }`

## Comments (`/comments`)

- POST `/comments`
  - Protégé (Bearer JWT)
  - Corps: `CreateCommentDto`
  - Crée un commentaire (CommentEntity)

- GET `/comments?userId=<number>&trackId=<number>`
  - Protégé (Bearer JWT)
  - Filtrage optionnel par `userId` et/ou `trackId` (CommentEntity[])

- GET `/comments/:id`
  - Protégé (Bearer JWT)
  - Détail d’un commentaire (CommentEntity)

- PATCH `/comments/:id`
  - Protégé (Bearer JWT)
  - Met à jour un commentaire (UpdateCommentDto)

- DELETE `/comments/:id`
  - Protégé (Bearer JWT)
  - Supprime un commentaire

## Ratings (`/ratings`)

- POST `/ratings`
  - Protégé (Bearer JWT)
  - Corps: `CreateRatingDto`
  - Crée une note (RatingEntity)

- GET `/ratings?userId=<number>&trackId=<number>`
  - Protégé (Bearer JWT)
  - Filtrage optionnel par `userId` et/ou `trackId` (RatingEntity[])

- GET `/ratings/:id`
  - Protégé (Bearer JWT)
  - Détail d’une note (RatingEntity)

- PATCH `/ratings/:id`
  - Protégé (Bearer JWT)
  - Met à jour une note (UpdateRatingDto)

- DELETE `/ratings/:id`
  - Protégé (Bearer JWT)
  - Supprime une note

- GET `/ratings/track/:trackId/average`
  - Protégé (Bearer JWT)
  - Renvoie `{ trackId, average, count }` pour la piste

## Follows (`/follows`)

- POST `/follows`
  - Protégé (Bearer JWT)
  - Corps: `{ userId: number }` (FollowUserDto)
  - Suivre un utilisateur (FollowEntity)

- DELETE `/follows/:userId`
  - Protégé (Bearer JWT)
  - Ne plus suivre un utilisateur

- GET `/follows/stats/:userId`
  - Protégé (Bearer JWT)
  - Statistiques de suivi d’un utilisateur (followers, following)

- GET `/follows/following/:userId`
  - Protégé (Bearer JWT)
  - Liste des utilisateurs suivis (UserFollowInfoDto[])

- GET `/follows/followers/:userId`
  - Protégé (Bearer JWT)
  - Liste des followers (UserFollowInfoDto[])

- GET `/follows/check/:userId`
  - Protégé (Bearer JWT)
  - Vérifie si l’utilisateur connecté suit `userId` → `{ isFollowing: boolean }`

## Racine (`/`)

- GET `/`
  - Public
  - Retourne un message de santé depuis `AppController.getHello()`

---

Notes:
- Les schémas précis des DTOs sont visibles dans le code (`backend/src/**/dto`) et via Swagger.
- Les entités sérialisées sont visibles dans `backend/src/**/entities`.
- Assurez-vous d’envoyer le header `Authorization: Bearer <token>` pour les routes protégées.
