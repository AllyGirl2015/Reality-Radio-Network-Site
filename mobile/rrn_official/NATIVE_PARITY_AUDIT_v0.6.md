# RRN Mobile v0.6 — Native Parity Audit

This file is the contract between the Android app and the next RealityRadio.net / App Translation Matrix build.

## Rule

A screen is **native** only when its user interface is rendered by the app and its data/actions come from a supported app API. Opening RealityRadio.net in a WebView/browser is a fallback, not native parity. Calling a nonexistent generic Matrix endpoint is also not parity.

## Already available from `/api/app/v1` — client must use these natively

These routes are present in the current App Translation Matrix and therefore do **not** require a new site route just to become native:

- Auth: `/auth/login`, `/auth/logout`, `/auth/me`, `/auth/refresh`, `/auth/sessions`
- Bootstrap / capabilities: `/bootstrap`, `/capabilities`, `/runtime`, `/navigation`, `/sync`
- Charts: `/charts`, `/charts/[slug]`, `/charts/[slug]/nominate`, `/charts/[slug]/vote`
- Feed: `/feed`, `/feed/[slug]`, `/feed/[slug]/interact`
- Messages: `/messages`
- Notifications: `/notifications`
- Music catalog: `/music/catalog`, `/music/search`, `/music/favorite`
- Points: `/points`
- Listening: `/listening`
- Radio: `/radio/directory`, `/radio/state`, `/radio/presets`, `/radio/saved`
- Store digest: `/store`
- Device: `/device/register`, `/device/push`
- Generic actions endpoint: `/actions`

### Client fixes required now

1. **Feed list/detail/reactions/comments** must stay on the native `/feed` routes. Do not route Feed through a generic page renderer.
2. **Messages and notifications** must stay native.
3. **Music catalog/search/favorites** must stay native.
4. **Store** should consume `/api/app/v1/store` in a native store renderer instead of immediately opening the website when the current digest contains enough data/actions.
5. **More/navigation** must stop assuming `/api/app/v1/page?path=...` exists. The route does not exist in the current Matrix.
6. `MatrixActionButton` must use the actual `/api/app/v1/actions` contract rather than inventing `/action/<id>` unless a route-specific action is supplied by the Matrix.
7. Known first-class screens must never be sent through `MatrixPageScreen` merely because that was convenient during alpha development.

## Feed defect: official RRN posts are missing in the app

The public website Feed is explicitly the publication stream for **RRN, Artists, Personas, Labels and Stations**. The app Matrix `/feed` wrapper therefore needs to return the same public/published window, including `author_type='rrn'` records.

### Inspect/fix in the next site build if the current wrapper is filtering them

The app feed response must include, for every public post type including official RRN posts:

- `id`, `slug`, `title`, `summary`, body/detail data
- `post_type`, visibility/publish timing
- `author_type` including `rrn`
- resolved author display name/avatar/verification and identity IDs
- hero image and attached feed media
- tags, pinned, featured
- comments/reactions enabled flags
- reaction count, comment count, viewer reaction when signed in
- referenced event/page/resource where applicable
- stable pagination cursor

The wrapper should share the same public visibility rules as the web `/feed` page rather than maintaining a second, narrower interpretation of a feed post.

## Missing app-native backend contracts — NEXT SITE BUILD

### 1. Account Music Library

The website already has library data, but there is no equivalent `/api/app/v1/library` route for an app bearer session.

Add:

- `GET /api/app/v1/library`
  - favorites
  - owned tracks/releases
  - pre-orders and unlock timestamps
  - entitlement IDs/status
  - playable stream URL when entitled
  - artwork, artist, release/track metadata
  - download capability/action when entitled
- optional filtered views, e.g. `?section=favorites|owned|preorders`

The mobile app should then remove its direct call to the legacy cookie-oriented `/api/library/music` route.

### 2. Playlists

Add:

- `GET /api/app/v1/playlists`
- `POST /api/app/v1/playlists` — create
- `GET /api/app/v1/playlists/[id]`
- `PATCH/POST /api/app/v1/playlists/[id]` — rename/settings/reorder as appropriate
- action to add a track/owned entitlement
- action to remove a track
- delete playlist if supported by the website product

Return native-playback-ready track records so selecting a playlist can become the Media3 queue directly.

### 3. Native Feed Publishing

Current app Matrix exposes read/detail/interact but not a mobile bearer-token publish contract.

Add either:

- `POST /api/app/v1/feed` for publishing, or
- `POST /api/app/v1/feed/publish`

It must expose the posting identities the account is allowed to use (RRN/station/artist/persona/label/user as permitted), post type, title/summary/body, tags, media upload references, comments/reactions flags, scheduling fields and referenced resources.

Do not require a web-cookie session or HTML form redirect.

### 4. Friends / Following

The website has social friendship APIs, but no app-v1 wrapper is present in the current route set.

Add a bearer-token app contract for:

- friends list / pending requests
- send request
- accept/decline/cancel/remove
- following/followers if this is a distinct social relation in RRN

### 5. Events

The website has event and RSVP APIs, but no app-v1 events wrapper is present in the current route set.

Add:

- event discovery/detail digest
- RSVP state and action
- account-specific event state where applicable

### 6. Generic page/resource translation — only if RRN wants broad Matrix parity

The current app contains a generic native block renderer, but the backend does **not** expose `/api/app/v1/page`.

Either:

A. add `GET /api/app/v1/page?path=<allowlisted path>` plus safe native blocks/actions, **or**
B. stop using generic page translation and add dedicated resource routes/screens for Shows, Presenters, Artists, Support, Submissions, About/Legal, etc.

Do not leave the app in the current middle state where it advertises a generic native renderer and then 404s.

## Currently native in the app

- Native account sign-in/session restoration
- Reality Dial UI and tuner state
- Station directory
- Saved stations and per-band presets
- Music catalog/search/favorite
- Music playback UI/queue
- Feed list/detail/reaction/comment UI
- Messages
- Notifications
- Charts
- Points

## Native but incomplete / defective

- **Android playback integration** — v0.6 replaces Flutter `audio_service` as the Android system-session owner with native AndroidX Media3 `MediaSessionService`.
- **Reality Dial stream controls** — add explicit Play/Pause/Stop/Mute/volume/status controls to the station panel and bind them to the same Media3 session.
- **Feed** — app rendering is native, but official RRN posts are not appearing; inspect Matrix feed source/visibility mapping as described above.
- **Store** — app-v1 route exists; client still needs a proper native renderer/action flow.

## Not truly native in v0.5.1

- Full account Music Library / owned music
- Playlists
- Feed post creation
- Friends
- Events
- Store purchase flow where app falls back to web
- Generic More surfaces using `MatrixPageScreen`
- Any `WebFallbackScreen` destination

## v0.6 acceptance bar

1. Starting music produces a real Android system media card immediately.
2. The same session appears on the lock screen and accepts Bluetooth/headset media buttons.
3. Music publishes Previous / Play-Pause / Next and its queue to Android.
4. Radio publishes a live Media3 session with Play/Pause and current station/track metadata.
5. Playback continues with the screen off and app backgrounded.
6. Reality Dial has visible stream controls, not merely tuner controls.
7. No known first-class app screen silently routes to nonexistent `/api/app/v1/page`.
8. Web fallbacks are visibly treated as temporary gaps and mapped to this audit, never described as native functionality.
