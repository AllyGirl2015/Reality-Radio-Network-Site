# RRN Mobile v0.3 — Website Parity Translation Matrix Contract

This document is the backend handoff for the official RRN mobile app.

## Governing rule

The website remains the canonical RRN platform. The app must be able to access the same public information, authenticated information, permissions, workflows, controls, purchases, social state, radio state, charts, creator/station-owner functionality, and Studio/admin surfaces that the same account is allowed to access on the website.

The app renders those capabilities ergonomically as native app UI. The backend decides authorization. The app must never gain a permission that the same RRN account lacks on the website.

Existing `/api/app/v1/*` routes should be expanded rather than creating a second mobile-only data model.

---

# 1. Existing app Matrix routes already expected by the client

- `POST /api/app/v1/auth/login`
- `POST /api/app/v1/auth/logout`
- `GET /api/app/v1/auth/me`
- `POST /api/app/v1/auth/refresh`
- `GET /api/app/v1/auth/sessions`
- `GET /api/app/v1/bootstrap`
- `GET /api/app/v1/manifest`
- `GET /api/app/v1/charts`
- `GET /api/app/v1/charts/:slug`
- `POST /api/app/v1/charts/:slug/nominate`
- `POST /api/app/v1/charts/:slug/vote`
- `GET /api/app/v1/music/search`
- `POST /api/app/v1/music/favorite`
- `GET /api/app/v1/radio/directory`
- `GET/POST /api/app/v1/radio/presets`
- `GET/POST /api/app/v1/radio/saved`
- `GET/POST /api/app/v1/radio/state`

The Android app must use these routes rather than web-form/cookie endpoints when a native Matrix route exists.

---

# 2. Universal app manifest / navigation

## `GET /api/app/v1/manifest`

The manifest should eventually expose every app-renderable site module appropriate to the current build/account.

Suggested shape:

```json
{
  "matrixVersion": "1.3",
  "minimumAppVersion": "0.3.0",
  "features": {},
  "radioBands": ["PFL", "RMP", "TFP", "PFH", "ASHP"],
  "navigation": [
    {"id":"radio","title":"Reality Dial","path":"/radio","renderer":"radio"},
    {"id":"music","title":"Music","path":"/music","renderer":"music"},
    {"id":"social","title":"Connect","path":"/social","renderer":"social"},
    {"id":"charts","title":"Reality Charts","path":"/charts","renderer":"charts"},
    {"id":"store","title":"Store","path":"/store","renderer":"store"}
  ]
}
```

Navigation should be permission aware after authentication.

---

# 3. Generic website-parity page digest

## `GET /api/app/v1/page?path=/some/site/path`

Purpose: allow site sections that do not yet justify a bespoke native renderer to remain available in the app without reducing access.

The response is a safe data/action description, not arbitrary downloaded executable code.

Suggested shape:

```json
{
  "path": "/account/services",
  "title": "Services",
  "summary": "...",
  "blocks": [
    {"type":"text","body":"..."},
    {"type":"card_list","items":[]},
    {"type":"table","columns":[],"rows":[]},
    {"type":"form","actionId":"service.update","fields":[]},
    {"type":"media","items":[]}
  ],
  "actions": [
    {"id":"service.update","label":"Save","method":"POST","endpoint":"/api/app/v1/action/service.update"}
  ]
}
```

Supported safe native block primitives should include at minimum:

- text / rich text
- heading
- image/media
- stat
- card
- card_list
- list
- table
- tabs
- notice
- form
- button/action row
- feed
- chart
- audio item
- product
- order
- profile/person
- station
- show
- event
- giveaway
- poll

Unknown types render a generic object card and may link to a website fallback.

---

# 4. Generic authorized action Matrix

## `POST /api/app/v1/action/:actionId`

All privileged site controls that do not have a dedicated native endpoint can be delegated through a permission-checked action dispatcher.

Requirements:

- bearer app session required when the website action requires auth
- use the same permission checks/business rules as the website implementation
- explicit allow-list of app-callable actions; never route arbitrary method/path execution
- CSRF is replaced by app-session authorization and action-specific validation
- idempotency key supported for purchases, point redemptions, moderation and other sensitive writes
- audit log the RRN account, app session, action, target and result

---

# 5. Social Matrix (to add to the website backend)

The v0.3 client is coded against these routes.

## Feed
- `GET /api/app/v1/social/feed`
- `POST /api/app/v1/social/publish`
- `POST /api/app/v1/social/feed/:id/interact`
- `GET /api/app/v1/social/feed/:id/comments`
- `POST /api/app/v1/social/feed/:id/comments`

## People / friendships
- `GET /api/app/v1/social/profile/:id`
- `GET /api/app/v1/social/friends`
- `GET /api/app/v1/social/friends/search?q=`
- `GET /api/app/v1/social/friends/suggestions`
- `GET /api/app/v1/social/friends/requests`
- `POST /api/app/v1/social/friends/request`
- `POST /api/app/v1/social/friends/request/:id/respond`
- `DELETE /api/app/v1/social/friends/:id`

## Messages
- `GET /api/app/v1/social/messages/threads`
- `GET /api/app/v1/social/messages/thread/:id`
- `POST /api/app/v1/social/messages/thread/:id`
- `POST /api/app/v1/social/messages/read`
- `POST /api/app/v1/social/messages/typing`

## Presence / notifications
- `GET /api/app/v1/social/presence`
- `POST /api/app/v1/social/presence`
- `GET /api/app/v1/social/notifications`
- `POST /api/app/v1/social/notifications/:id/read`
- `POST /api/app/v1/social/notifications/read-all`

## Events
- `GET /api/app/v1/social/events`
- `GET /api/app/v1/social/events/:id`
- `POST /api/app/v1/social/events/:id/rsvp`

## Settings / blocks
- `GET/POST /api/app/v1/social/settings`
- `GET /api/app/v1/social/blocks`
- `POST/DELETE /api/app/v1/social/blocks/:id`

These should delegate to the existing website social tables/services so app and website users are the same social network.

---

# 6. Full account parity

The app account object should expose:

- profile/display identity
- avatar
- email/verification state
- roles
- permission slugs
- station memberships
- artist/presenter/label relationships
- notification settings
- connected Discord identity
- library/favorites
- orders/purchases
- subscriptions/services
- reports/support state where applicable
- points wallet

The app should expose all site account areas available to that user via native renderer or generic page digest.

---

# 7. Radio / Reality Dial parity

The app tuner must be continuous, not an array-index station selector.

The Matrix directory must provide:

- immutable station ID
- slug
- station name
- designation
- numeric frequency
- frequency band (`PFL`, `RMP`, `TFP`, `PFH`, `ASHP`)
- band limits/step if custom
- stream URL or safe playback locator
- artwork
- description/tagline/location
- live/offline state
- presenter
- show/program
- artist/track
- metadata source
- schedule
- history
- station capabilities
- user saved/preset state

Client behavior:

- dial can stop on dead frequencies
- generated static plays in dead space when enabled
- signal bleed mixes nearby stations when enabled
- tuner itself behaves identically when effects are disabled
- dial-audio auto mode automatically starts/acquires station audio like an old radio
- manual mode allows tuning without automatically changing currently playing station
- scan traverses actual band frequency until signal threshold is met
- seek goes to previous/next receivable station
- six presets save band + frequency + station ID where applicable

---

# 8. Station capability Matrix

Station record should expose capability descriptors, not just booleans.

Examples:

```json
{
  "capabilities": {
    "requests": {"enabled":true,"pointCost":5,"provider":"azuracast"},
    "shoutouts": {"enabled":true,"pointCost":20},
    "callins": {"enabled":true},
    "events": {"enabled":true},
    "giveaways": {"enabled":true},
    "voting": {"enabled":true}
  }
}
```

Independent Reality Dial stations may expose their own supported methods/providers.

---

# 9. RRN Points — rules locked for v0.3

RRN Points are a closed-loop in-network reward/credit balance.

## Fixed value

- **1 RRN point = $0.01 of RRN checkout value**
- 99 points may cover a $0.99 eligible RRN purchase
- balance may never go below zero
- no cash withdrawal / no redemption for money outside RRN
- points are account-wide across website, app and RRN Discord bot

## Earn

### Verified listening
- **10 points per verified hour** of eligible Reality Dial listening
- mathematically equivalent to 1 point per 6 verified listening minutes
- server awards the points; client heartbeats only prove active playback context
- listening session must stop when playback stops/disconnects or eligibility is lost
- server may enforce daily caps, duplicate-stream/device rules, bot/fraud detection, minimum continuous listening time and other anti-abuse rules

### Store purchase rewards
- qualifying RRN purchases may award points
- earning rate is **not yet fixed** and should be a backend/store setting, possibly per product/category/campaign
- purchase reward is granted only after the payment is settled/eligible
- refunds/chargebacks may reverse the awarded points; never permit a negative resulting balance—instead create debt/restriction handling server-side if required

### Direct point purchase
- purchase price follows fixed value: 1 point per $0.01 paid
- server creates payment-provider quote and confirms payment before crediting wallet
- app distribution channel may determine which compliant provider/payment API completes the purchase

## Spend

Initial supported uses:

- RRN Store products, including eligible music tracks/releases
- song requests on participating stations
- shoutouts on participating stations
- future station/network actions configured by capability
- RRN Discord bot actions

Points must not purchase chart rank/votes in a way that corrupts chart legitimacy.

## Checkout behavior

Support:

1. all-points purchase
2. optional split tender: apply points first, charge remaining currency amount through normal checkout
3. server quote before reservation
4. reserve/hold points during payment-sensitive operations
5. commit on successful fulfillment/transaction
6. release/refund hold on failure/cancellation
7. immutable point ledger

---

# 10. Points Matrix routes (to add)

## Wallet
- `GET /api/app/v1/points`
- `GET /api/app/v1/points/ledger`

## Listening rewards
- `POST /api/app/v1/points/listening/start`
- `POST /api/app/v1/points/listening/heartbeat`
- `POST /api/app/v1/points/listening/stop`

Expected listening start response:

```json
{
  "listeningSessionId":"uuid",
  "pointsPerHour":10,
  "eligible":true
}
```

## Direct purchase
- `POST /api/app/v1/points/purchase/quote`
- `POST /api/app/v1/points/purchase/confirm`

## Store redemption
- `POST /api/app/v1/points/checkout/quote`
- `POST /api/app/v1/points/checkout/redeem`

## Station spends
Suggested station capability endpoints:

- `GET /api/app/v1/radio/stations/:slug/requests?q=`
- `POST /api/app/v1/radio/stations/:slug/request`
- `POST /api/app/v1/radio/stations/:slug/shoutout`

Each spend endpoint must perform the point hold and provider action transactionally or compensate/refund on provider failure.

---

# 11. Suggested point ledger schema

Each transaction should have at least:

- id UUID
- user_id
- amount signed integer
- resulting_balance integer
- kind
- status (`pending`, `committed`, `reversed`, `expired`)
- source (`listening`, `store_reward`, `point_purchase`, `request`, `shoutout`, `checkout`, `refund`, `admin`, etc.)
- source_reference / external_reference
- idempotency_key
- description
- metadata JSONB
- created_at
- committed_at
- reversed_at

Balance must be mutated transactionally/with locking so concurrent requests cannot overspend.

---

# 12. Store parity

The app should render the same purchasable/owned state and fulfillment rules as the website store.

Required Matrix behavior:

- product browsing/search/filtering
- product detail
- inventory/availability
- digital/physical/service product types
- preorders/scheduled releases
- cart
- coupons where eligible
- checkout quote
- point application
- cash remainder payment
- order status/history
- digital entitlement/library delivery
- shipping/tracking where applicable
- subscription/service management where applicable

The store backend is always authoritative for price and eligibility. App-submitted displayed totals are never trusted.

---

# 13. Creator / station owner / presenter / Studio parity

Authenticated app access should eventually mirror website permission-gated tools, including:

- artist/profile/catalog management
- releases/tracks/assets
- labels and relationships
- station ownership, staff and talent
- station broadcast/operations/services
- presenter/show tools
- submissions
- services
- orders/payments/fulfillment
- Studio social/moderation
- user/role management for authorized staff
- developer/operations areas where deliberately mobile-enabled

High-risk destructive or bulk admin operations may require explicit re-authentication/confirmation, but should not be hidden merely because the client is mobile.

---

# 14. Security rules

- app tokens stored in Android Keystore / iOS Keychain-backed secure storage
- refresh tokens rotate
- session/device revocation supported
- no AzuraCast admin key, Discord bot token, payment secret, database secret or private storage key in the app
- Matrix actions re-run server permission checks
- point balance is never client-authoritative
- listening reward is never client-authoritative
- store price is never client-authoritative
- rate limits on auth, messages, requests, shoutouts and financial/point actions
- idempotency on all sensitive spends/purchases
- immutable/auditable ledger for points

---

# 15. App fallback policy

1. Dedicated native renderer where one exists (Dial, Music, Social, Charts, Store, Account).
2. Generic Translation Matrix page/action renderer for remaining site areas.
3. Website fallback only when a server feature has not yet been exposed to the Matrix.

The long-term goal is that every website surface an account can access is also available in the app, with a more ergonomic mobile presentation rather than a reduced feature set.
