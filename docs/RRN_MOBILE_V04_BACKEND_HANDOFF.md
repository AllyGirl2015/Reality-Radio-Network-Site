# RRN Mobile v0.4 — Website Parity Backend Handoff

This document is the server-side contract expected by the native RRN mobile application. The product rule is strict:

> Any information, permission, state, control, creation flow, management action, purchase flow, social interaction, or administrative function available to an account on RealityRadio.net must have an equivalent mobile representation.

The mobile UI may reorganize a desktop surface for phone ergonomics, but the backend capability must remain the same.

Base native API: `/api/app/v1`

## 1. Authentication / identity

Already expected:

- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /auth/me`
- device/session management

`/auth/me` should include the canonical RRN account, roles, permissions, linked identities, points balance summary, profile/avatar, creator/presenter/station-owner relationships, and any feature flags relevant to mobile rendering.

Mobile bearer tokens must authorize the same account permissions as the website session.

## 2. App manifest / navigation parity

`GET /manifest`

Return the complete navigation/module surface available to the current account. Each module should include:

- stable id
- title / label
- path
- description
- icon hint
- permission/capability requirements
- renderer hint where helpful
- badge/count where relevant
- deep-link target

The app must not maintain a hand-curated subset of RealityRadio.net.

## 3. Generic page + action parity

Required for long-tail website parity and newly added site features:

### `GET /page?path=/some/site/path`

Return a versioned digest that describes the information and available actions on the corresponding site surface without sending executable code.

Recommended shape:

```json
{
  "schemaVersion": 1,
  "path": "/some/site/path",
  "title": "Page title",
  "permissions": [],
  "blocks": [],
  "actions": []
}
```

Supported native block families should eventually include text, rich text, image, hero, card, list, table, tabs, form, profile, station, track, release, artist, show, presenter, event, giveaway, poll, chart, product, order, analytics, file, audio, notification, message/thread, admin control and generic fallback card.

### `POST /action/:actionId`

Perform a permission-checked server action described by the page digest. Actions must remain server-authoritative and must never expose privileged service credentials.

Unknown block/action types must remain safely representable through a generic mobile fallback rather than disappearing.

## 4. Radio directory + search

### `GET /radio/directory`

Return **all directory listings**, not only currently broadcasting stations:

- live
- testing
- coming soon
- off air
- external/independent
- RRN-operated
- hidden/private only when caller has permission

Every station should expose a stable immutable `stationId` separate from frequency/designation.

Recommended station fields:

- stationId
- slug
- name
- shortName
- designation
- numeric frequency
- band (`PFL`, `RMP`, `TFP`, `PFH`, `ASHP`)
- status
- stream URL when receivable
- artwork/logo
- tagline
- description
- genres
- formats
- keywords/tags
- location/market
- operator/owner summary where public
- presenters/shows where public
- capabilities
- current metadata summary
- source/network type
- links
- launch/coming-soon metadata
- visibility
- account-specific saved/followed state

### Search

Either allow query/filter parameters on `/radio/directory` or add `/radio/search`.

Search must be able to match at least:

- station name
- short/custom name
- numeric frequency
- full designation (`201.5 RMP`)
- band
- genre
- format
- keywords/tags
- description/tagline
- presenter/show associations where appropriate
- location
- operator/owner information when public

Filters should include band, status, genre/format, RRN vs external/independent, saved/followed and live/coming-soon.

## 5. Radio state / metadata

### `GET /radio/state`

Accept stable station id and/or slug. Return a normalized radio object:

- station identity
- frequency/band/designation
- presenter
- show/program
- artist
- title/track
- artwork
- live/auto/replay/off-air state
- source
- timestamps/revision

This object feeds Dial UI, station pages, notification/lock-screen metadata and automotive rendering.

## 6. Saved stations — unlimited and band-aware

Saved Stations are an unlimited personal station library. They are not the same thing as presets.

### `GET /radio/saved-stations`
### `POST /radio/saved-stations`
### `DELETE /radio/saved-stations/:savedId` or equivalent action

Per saved station persist:

- stable saved id
- station id / slug
- band
- frequency
- official station name
- user nickname
- artwork snapshot/reference
- created/updated timestamps

Official station metadata may change without destroying the user's nickname.

## 7. Presets — six **per band**

This is not one global set of six.

Each band has an independent preset bank:

- PFL slots 1–6
- RMP slots 1–6
- TFP slots 1–6
- PFH slots 1–6
- ASHP slots 1–6

### `GET /radio/presets`
### `POST /radio/presets`

Recommended unique key: `(user_id, band, slot)`.

Preset fields:

- band
- slot 1–6
- station id / slug when applicable
- exact numeric frequency
- official station name
- user custom preset label

Allow manual frequency presets when appropriate, not only database station ids.

## 8. Full station page parity

The app must be able to open a Station Page from the tuner, station search, saved stations, feed, charts, events and links.

Provide either dedicated native endpoints or `/page` parity for the complete website station surface, including any information/actions the account can access:

- About/details
- current metadata
- Listen
- Save/follow
- schedule
- shows/backlogs
- presenters
- station feed/posts
- requests
- shoutouts
- call-ins
- events
- giveaways
- polls/voting
- station charts
- history
- ownership/operator info
- analytics when permitted
- branding/settings
- schedule management
- presenter management
- interaction configuration
- stream/source configuration
- moderation/owner/admin controls

Do not hardcode listener-only capabilities into the Matrix. Permissions decide what is returned.

## 9. Music catalog + ownership

The app currently falls back to the public website catalog endpoints:

- `/api/v2/albums`
- `/api/v2/singles`
- `/api/v2/artists`
- `/api/v2/tracks?albumId=...`

The app Matrix should eventually normalize the same catalog and add account entitlement state.

Required app-native resources:

- full catalog
- artists
- releases/albums/EPs/singles
- track lists
- artwork
- descriptions/credits
- genres/year/catalog numbers
- preview/stream source
- store/purchase source
- ownership/entitlement state
- price
- points price
- favorites/library state
- release availability

Account endpoints should expose all purchased/owned music so the app can render **owned and unowned items in the same catalog**.

## 10. Store parity

Everything purchasable/manageable through RealityRadio.net must be representable on mobile.

Needed:

- products/search/categories
- product detail
- cart
- checkout quote
- orders
- purchase history
- music entitlements
- fulfillment state
- account billing/customer state as permitted

Payment-provider secrets remain server-side.

## 11. RRN Points — one network-wide closed-loop balance

Rules currently specified by product owner:

- no negative points
- no cash withdrawal/redemption outside RRN
- 1 point represents approximately `$0.01` of eligible RRN purchase value
- `$0.99` eligible track = `99 points`
- points may substitute for eligible store purchases
- split tender should be possible where checkout supports it
- direct purchase of points should be supported through the store/payment backend
- verified listening earns `10 points/hour` (1 point per 6 verified minutes)
- store purchases may earn configurable points
- requests, shoutouts and other in-network services may charge points
- Discord bot, website and mobile app must use the same authoritative ledger

Recommended endpoints:

- `GET /points` — balance + summary
- `GET /points/ledger`
- `POST /points/quote`
- `POST /points/purchase` or store-backed checkout intent
- `POST /points/hold`
- `POST /points/commit`
- `POST /points/release`
- `POST /points/redeem`

For failure-prone actions: hold/reserve -> perform external action -> commit; release/refund on failure.

Never trust a client-supplied balance or client-supplied final point cost.

## 12. Listening rewards

Listening rewards must be server verified.

Recommended flow:

- `POST /listening/start`
- `POST /listening/heartbeat`
- `POST /listening/stop`
- `GET /listening/status`

Session should bind account, device/session, station/content and server time. Award at the configured equivalent of 10 points/hour only for validated listening. Enforce anti-abuse rules server-side.

## 13. Requests / shoutouts / station actions

Song requests should flow:

Mobile -> RRN backend -> points hold -> station adapter/AzuraCast -> commit or refund.

Do not ship AzuraCast or Discord privileged credentials in the app.

Per-station capability payload should describe availability, pricing, cooldowns and required fields.

Same pattern applies to paid-point shoutouts and future station actions.

## 14. Reality Charts — full parity

Existing native Matrix support includes browse/detail/nominate/vote. Mobile also needs everything the website permits for creation and management.

Required based on account permissions:

- chart list/search/filter
- detail/rankings/history
- nominations
- voting
- create chart
- edit metadata/rules
- configure candidate/nomination policy
- voting windows
- station/presenter/community ownership
- publish/unpublish/archive
- moderation
- manual/admin ranking controls where website supports them
- analytics/participation where exposed

Suggested routes:

- `POST /charts` — create
- `PATCH /charts/:slug` or generic action endpoint — edit
- `/charts/:slug/manage` digest/actions
- publish/archive/moderation actions

Do not monetize chart rank/votes with RRN Points unless a separate product policy explicitly authorizes it.

## 15. Native Social Matrix

The website social graph/feed must become accessible to bearer-token app sessions.

Recommended `/social/*` resources:

- feed
- posts create/edit/delete
- comments
- reactions
- follows
- profiles
- friends/connections
- messages/threads
- presence where appropriate
- notifications
- events/RSVP
- blocking/reporting/moderation
- privacy/settings

The app should use the same account, graph, posts, messages and permissions as RealityRadio.net. Do not create a parallel mobile-only social system.

## 16. Push notifications

Expose device token registration and notification preferences for:

- social activity/messages
- followed station/show going live
- request status / request played
- call-in accepted
- giveaway state/result
- event reminders
- chart voting/results
- release alerts
- purchases/order/entitlement events

Media playback notification controls are device-native and separate from push notification delivery.

## 17. Creator / presenter / station-owner / Studio parity

Any authenticated site role must receive equivalent controls in the app when permitted. This includes artist, presenter, station owner/operator, label/service clients and staff/admin Studio surfaces.

Use the generic page/action Matrix to ensure long-tail parity while high-use tools receive dedicated native screens.

## 18. Security invariants

- Mobile app never receives database service-role keys.
- Never embed Discord bot token.
- Never embed AzuraCast admin credentials.
- Never embed payment-provider private keys.
- Permission checks are server-side.
- Monetary/points totals and entitlement decisions are server-side.
- Actions use idempotency keys where duplicate submission has financial/points impact.
- Every privileged action is auditable.

## 19. Compatibility philosophy

The Translation Matrix should normalize RRN objects and actions. It must **not** deliver arbitrary executable code.

Native clients own rendering. New content instances and ordinary new pages should be able to appear without app updates using supported block/action types. Truly new native capabilities may require a client update.

**Build the feature once on RRN. Translate it everywhere.**
