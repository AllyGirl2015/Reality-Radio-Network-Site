# RRN Mobile v0.7 Native Parity Audit

## App-side work in v0.7

- Normalize live station metadata from both the App Matrix model and the website/provider model (`who`, `artist`, `song`, `source`, artwork).
- Fuse the station identity and active metadata display into the mobile Reality Dial hardware surface.
- Feed the same live metadata object into in-app playback, the Android notification, lock-screen media session and automotive media metadata path.
- Prefer track artwork for active media surfaces, falling back to station artwork when track artwork is unavailable.
- Resolve Feed posting fronts before the underlying account: RRN/network, artist, persona, station, label, then member.
- Request up to 150 Feed rows to match the current website public Feed window and retain native scope support.
- Render the base RRN Points wallet from `/api/app/v1/points` without failing just because optional ledger/purchase routes are absent.
- Ship a complete native playlist client surface that activates automatically when the Matrix playlist routes become available.

## Required RealityRadio.net / App Translation Matrix additions

### Feed parity

`GET /api/app/v1/feed?scope=official|community|all` must use the same public visibility/window rules as the website Feed and return the complete posting identity rather than collapsing it to the underlying user.

Normalize every post with:

- `id`, `slug`, `title`, `summary`, `body`, `postType`
- `publishedAt`, `visibleAt`, `pinned`, `featured`
- `heroImageUrl`, `media[]`, `tags[]`
- `author: { type, id, name, avatarUrl, subtitle, verified, badges[] }`
- `commentCount`, `reactionCount`, `viewerReaction`
- native action/capability flags

`scope=official` must match the website `/feed` concept and exclude ordinary member-authored community posts while including RRN/RBEW, artist, persona, label and station identities.

### Native playlists / owned library

The existing website playlist routes use the website session model. Add bearer-session App Matrix routes:

- `GET /api/app/v1/library`
- `GET /api/app/v1/library/playlists`
- `POST /api/app/v1/library/playlists`
- `GET /api/app/v1/library/playlists/[id]`
- `PATCH /api/app/v1/library/playlists/[id]`
- `DELETE /api/app/v1/library/playlists/[id]`
- `POST /api/app/v1/library/playlists/[id]/tracks`
- `DELETE /api/app/v1/library/playlists/[id]/tracks/[trackId]`

Playlist list/detail responses should include normalized native playback fields (`id`, title/name, artist, artwork, stream URL/media resource ID, duration) so the app can create a real playback queue.

### Points

The current `/api/app/v1/points` route is sufficient for base balance rendering. If supported, extend it or add explicit contracts for:

- transaction/ledger history
- direct point purchase quote/confirmation
- checkout point quote/redemption
- verified listening session start/heartbeat/stop

Until those capabilities are exposed, the app intentionally renders the server-authoritative balance and does not invent purchase/reward actions.

## Media metadata contract

`/api/app/v1/radio/state` should normalize active metadata, ideally as:

```json
{
  "nowPlaying": {
    "presenter": "Otto",
    "show": "",
    "artist": "Alicia Keys",
    "title": "Sure Looks Good To Me",
    "source": "icy",
    "artwork": "https://...",
    "live": true
  }
}
```

The mobile client remains backward-compatible with the existing website/provider names `who` and `song`.
