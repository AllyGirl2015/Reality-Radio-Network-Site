# RRN Mobile v0.6 Native Parity Audit

This file is the contract between the Android app and the next RealityRadio.net / App Translation Matrix build.

## Already native and backed by /api/app/v1

- Native app authentication: `/api/app/v1/auth/login`, `/me`, `/refresh`, `/logout`, `/sessions`.
- Reality Dial data/state: `/api/app/v1/radio/directory`, `/radio/state`, `/radio/presets`, `/radio/saved`.
- RRN Music public catalog/search/favorites: `/api/app/v1/music/catalog`, `/music/search`, `/music/favorite`.
- Charts: `/api/app/v1/charts`, chart detail, vote, nominate.
- Feed reading/detail/interactions: `/api/app/v1/feed`, `/feed/[slug]`, `/feed/[slug]/interact`.
- Messages, notifications and points: `/api/app/v1/messages`, `/notifications`, `/points`.
- Device/push registration surfaces: `/api/app/v1/device/register`, `/device/push`.
- Store digest exists: `/api/app/v1/store`.
- Generic action/capability/runtime/sync endpoints exist.

## App-side fixes in v0.6

- Publish current playback to a native Android MediaSession/MediaStyle notification surface rather than relying on the Flutter audio plugin to create the system UI indirectly.
- Route Android lock-screen / notification previous and next into real RRN transport commands.
- For live radio, Previous and Next mean scan down / scan up on the Reality Dial.
- Show scan controls on the internal mini-player and live Now Playing screen.
- Remove web fallback where an existing App Matrix endpoint can already drive a native screen.
- Prepare Official Feed vs Community Feed as separate scopes in the native Connect UI.

## Required in the next site / Translation Matrix build

### 1. Official Feed parity

The website `/feed` is the official RRN/RBEW/artist/persona/label/station publication stream. Member/community posts are a different stream. The app bridge needs to preserve this distinction.

Preferred contract:

- `GET /api/app/v1/feed?scope=official|community|all`
- `scope=official` returns Reality Radio Network, RBEW, artist, persona, label and station identities, matching website `/feed` behavior.
- `scope=community` returns member/community posts.
- Normalize each item with `id`, `slug`, `title`, `summary`, `body`, `postType`, `publishedAt`, `heroImageUrl`, `media[]`, `pinned`, `featured`, `author`, `commentCount`, `reactionCount`, `viewerReaction`, and interaction capabilities.

### 2. Native feed publishing

Current app can read/interact but cannot publish natively without falling through the nonexistent generic page bridge.

Add:

- `GET /api/app/v1/feed/posting-identities`
- `POST /api/app/v1/feed/publish`
- Optional edit/delete wrappers for the authenticated author's posts.

These must accept the same app bearer session as the other Matrix routes.

### 3. Native Library and Playlists

The website has `/api/library/music` and `/api/library/playlists/[id]`, but the App Matrix has no native bearer-session library/playlist contract.

Add:

- `GET /api/app/v1/library`
  - favorites
  - owned tracks/releases
  - preorders and availability state
  - download/stream entitlements
  - recent library activity if available
- `GET /api/app/v1/library/playlists`
- `POST /api/app/v1/library/playlists`
- `GET /api/app/v1/library/playlists/[id]`
- `PATCH /api/app/v1/library/playlists/[id]`
- `DELETE /api/app/v1/library/playlists/[id]`
- `POST /api/app/v1/library/playlists/[id]/tracks`
- `DELETE /api/app/v1/library/playlists/[id]/tracks/[trackId]`

The app should never need a cookie-authenticated web view for normal library or playlist use.

### 4. Generic safe page translation

The app already contains a safe native block/action renderer, but the corresponding endpoint is missing. This is why routes such as `/library`, `/shows`, `/presenters`, `/events`, `/support`, `/submissions`, `/about`, and legal/information pages can fall into a 404 placeholder.

Add:

- `GET /api/app/v1/page?path=<site-path>`

Return only whitelisted native blocks/actions. Do not return executable code, arbitrary HTML, or JavaScript.

This endpoint should be the catch-all parity bridge for informational / form pages that do not justify a dedicated app API.

### 5. Dedicated app wrappers that should not depend on generic pages

Recommended dedicated routes because they are interactive/product surfaces:

- `/api/app/v1/events`
- `/api/app/v1/friends`
- `/api/app/v1/following`
- `/api/app/v1/shows`
- `/api/app/v1/presenters`
- `/api/app/v1/artists`
- `/api/app/v1/submissions`
- `/api/app/v1/support`

### 6. Store

`/api/app/v1/store` already exists. The app should consume that route natively for browsing. Checkout/payment may remain a controlled web handoff until a native payment flow is deliberately implemented.

## Rule for future app work

A screen must be tagged internally as one of:

1. **Native + Matrix backed** — preferred.
2. **Native renderer waiting on a documented Matrix endpoint** — allowed during alpha, must show the exact missing endpoint.
3. **Intentional external handoff** — payment, legal external service, or another function that must leave the app.

Normal product navigation must not silently become a WebView because an endpoint was forgotten.
