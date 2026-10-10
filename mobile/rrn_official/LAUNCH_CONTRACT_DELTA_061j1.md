# RRN Mobile Android Launch Contract Delta — 061j1

Target: final Android launch-readiness pass before iOS translation.
Backend baseline observed from live 061j1 health / route inventory: App Matrix contract v3, 214 controllers, 209 pages, native account/feed/library/store/points/radio resources present.

This file intentionally lists only the contracts that are still ambiguous or incomplete for a deterministic mobile implementation. Routes that already exist and have sufficient read semantics should not be duplicated.

## 0. Production prerequisite: notification/charts worker

The unified notification/charts worker must be healthy before release QA. Current deployment evidence showed the service restart-looping with `DATABASE_URL missing` while the 061j1 web process itself was healthy.

This is infrastructure, not an APK contract, but launch notification/scheduled-chart behavior cannot be signed off until the worker is active.

## 1. Canonical Matrix action execution

Current live route inventory exposes:

- `GET/POST /api/app/v1/actions`
- `GET /api/app/v1/page?path=...`
- `ANY /api/app/v1/controller/{path}` (allow-listed controller bridge)

The old mobile contract expected `/api/app/v1/action/:actionId`, which does not match the live route inventory.

For every action returned by `/page`, `/controllers`, `/actions`, `/store`, account resources, or another Matrix payload, return a directly executable descriptor:

```json
{
  "id": "stable.action.id",
  "label": "Save",
  "method": "POST",
  "endpoint": "/api/app/v1/controller/account/profile",
  "payload": {},
  "confirm": null,
  "idempotencyRequired": false,
  "result": {
    "refresh": true,
    "navigate": null
  }
}
```

Alternatively, if `/api/app/v1/actions` is the canonical dispatcher, freeze and document its exact request/response body. Preferred request:

```json
{
  "actionId": "stable.action.id",
  "payload": {},
  "idempotencyKey": "optional-uuid"
}
```

Preferred response:

```json
{
  "ok": true,
  "message": "Saved.",
  "data": {},
  "refresh": true,
  "navigate": null
}
```

Do not return action IDs without either a canonical dispatcher schema or an executable `endpoint` + `method`.

Forms returned by `/page` should contain:

```json
{
  "type": "form",
  "controller": "/api/app/v1/controller/account/profile",
  "method": "POST",
  "fields": []
}
```

## 2. Native Feed publishing contract

Existing routes are sufficient:

- `GET /api/app/v1/feed/posting-identities`
- `POST /api/app/v1/feed/publish`

Freeze the payload so the Android and iOS clients do not guess field names.

`GET /feed/posting-identities` should return:

```json
{
  "items": [
    {
      "key": "station:<uuid>",
      "type": "station",
      "id": "uuid",
      "label": "201.5 RMP",
      "subtitle": "Reality Central Radio",
      "avatarUrl": "/...",
      "verified": true,
      "allowedTypes": ["post", "article"],
      "canSchedule": true
    }
  ]
}
```

`POST /feed/publish` must accept either JSON or `multipart/form-data` with these canonical names:

- `identityKey`
- `postType`
- `title`
- `summary`
- `body`
- `tags`
- `heroImageUrl`
- optional uploaded hero/media file(s)
- `embedUrl`
- `commentsEnabled`
- `reactionsEnabled`
- `publishMode`: `publish | draft`
- optional `publishAt`
- optional `visibleAt`
- optional `displayTimer`
- `scheduleTimezone` (IANA timezone)

Return the normalized created/scheduled Feed post, including its exact public `author` posting front.

## 3. Station-scoped radio metadata — required correctness contract

Existing route:

- `GET /api/app/v1/radio/state`

Add/freeze the station selector:

`GET /api/app/v1/radio/state?station=<station-id-or-slug>`

When `station` is supplied, the server MUST NOT silently return metadata for a different/default station. An unknown selector should return 404 or an explicit empty state.

Canonical response:

```json
{
  "station": {
    "id": "uuid",
    "slug": "reality-central-radio",
    "designation": "201.5 RMP",
    "name": "Reality Central Radio"
  },
  "nowPlaying": {
    "presenter": "",
    "show": "",
    "artist": "",
    "title": "",
    "source": "icy",
    "artwork": "https://...",
    "live": true
  }
}
```

The echoed `station.id`/`station.slug` is required so clients can reject stale or cross-station metadata responses.

## 4. Native Store + checkout contract

Existing routes are sufficient in principle:

- `GET /api/app/v1/store`
- `POST /api/app/v1/checkout/quote`
- `POST /api/app/v1/checkout/confirm`

Freeze a product shape that includes:

- `id`, `slug`, `name`, `description`, `imageUrl`
- `productType`: `digital | physical | service | subscription | bundle`
- `priceCents`, `currency`, optional `salePriceCents`
- `pricePoints` or points eligibility
- `available`, `availabilityReason`
- `preorder`, fulfillment/unlock time
- `owned`, entitlement state
- shipping requirement where applicable
- `allowedPaymentRails`: e.g. `points`, `google_play`, `apple_iap`, `square_web`, `square_native` as policy permits

Preferred quote request:

```json
{
  "productId": "uuid",
  "quantity": 1,
  "requestedPoints": 0
}
```

Preferred quote response:

```json
{
  "quoteId": "uuid",
  "productId": "uuid",
  "subtotalCents": 0,
  "taxCents": 0,
  "totalCents": 0,
  "currency": "USD",
  "availablePoints": 0,
  "maxPointsApplicable": 0,
  "pointsApplied": 0,
  "cashRemainderCents": 0,
  "paymentRail": "points",
  "requiresExternalToken": false,
  "expiresAt": "ISO-8601"
}
```

Preferred confirm request:

```json
{
  "quoteId": "uuid",
  "idempotencyKey": "uuid",
  "pointsToSpend": 0,
  "paymentRail": "points",
  "providerToken": null,
  "providerTransactionId": null
}
```

Preferred response:

```json
{
  "ok": true,
  "orderId": "uuid",
  "status": "paid",
  "entitlements": [],
  "pointsBalance": 0
}
```

The backend must classify payment rail by product/platform so the app does not use Square for a transaction that an app-store policy requires to use store billing.

## 5. Direct RRN Points purchase contract + app-store billing

Existing route:

- `POST /api/app/v1/points/purchase`

Freeze the request/response and make the payment rail explicit. RRN Points are digital virtual currency, so a Play-distributed Android build and an iOS App Store build need platform-compliant billing behavior. The backend should accept verified platform transactions rather than requiring a Square card token for every mobile purchase.

Recommended request:

```json
{
  "points": 1000,
  "platform": "android",
  "paymentRail": "google_play",
  "productId": "rrn_points_1000",
  "purchaseToken": "provider-token",
  "transactionId": "provider-transaction-id",
  "idempotencyKey": "uuid"
}
```

For iOS the same route can use `paymentRail: apple_iap` and the signed StoreKit transaction identifier/JWS needed for server verification.

Recommended response:

```json
{
  "ok": true,
  "creditedPoints": 1000,
  "balance": 1234,
  "ledgerEntryId": "uuid",
  "transactionStatus": "verified"
}
```

If RRN chooses an enrolled alternative-billing/external-offer program for eligible regions, expose that choice in capabilities and in Store/Points payment-rail data. Do not make the client infer policy eligibility.

## 6. Native notification/account preferences

Current route tree has `/api/app/v1/account/settings`, while the website also has notification-specific web controllers. For mobile parity, either expand `/account/settings` or add:

- `GET /api/app/v1/account/notification-preferences`
- `PATCH /api/app/v1/account/notification-preferences`

Canonical fields should cover at least:

```json
{
  "push": {
    "enabled": true,
    "messages": true,
    "follows": true,
    "music": true,
    "announcements": true,
    "friendOnline": false
  },
  "email": {
    "messages": true,
    "follows": true,
    "music": true,
    "announcements": true
  },
  "social": {
    "profileVisibility": "public",
    "friendRequestPolicy": "everyone",
    "dmPolicy": "friends_and_following",
    "presenceVisibility": "friends"
  }
}
```

Writes must use the same website permission/business rules. Device-level OS notification permission remains client-side; `/device/register` remains the installation registration path.

Provider push delivery must also report truthful health. A registered device is not equivalent to a configured provider.

## 7. Account avatar

No new route is required merely to display an avatar if `/auth/me` or `/account/profile` returns it. Mobile clients will support both absolute and site-relative avatar URLs.

If avatar editing is expected natively, add or formally register an app controller for the website avatar upload operation, with multipart upload metadata and a normalized returned `avatarUrl`.

## 8. Routes already present — do not add duplicates

The Android client should use these existing native resources directly:

- Shows: `/api/app/v1/shows`
- Presenters: `/api/app/v1/presenters`
- Artists: `/api/app/v1/artists`
- Events: `/api/app/v1/events`
- Support: `/api/app/v1/support`
- Submissions: `/api/app/v1/submissions`
- Library/playlists: `/api/app/v1/library...`
- Orders: `/api/app/v1/account/orders`
- Stations: `/api/app/v1/account/stations`
- Presenter account: `/api/app/v1/account/presenter`
- Creator: `/api/app/v1/account/creator`
- Labels: `/api/app/v1/account/labels`
- Services: `/api/app/v1/account/services`
- Applications: `/api/app/v1/account/applications`
- Profile/settings: `/api/app/v1/account/profile`, `/api/app/v1/account/settings`
- Messages: `/api/app/v1/messages`, `/messages/people`
- About/Terms/Studio long-tail pages: `/api/app/v1/page?path=...` plus registered controller/action descriptors

The mobile bug here is routing/rendering/action execution, not missing API families.

## 9. No backend contract required for these Android fixes

- one shared play/pause/loading source of truth across Dial, mini-player, notification, lock screen and Bluetooth/media buttons
- one shared RRN output-volume model
- Android notification volume controls / MediaSession volume provider where the OS exposes them
- profile image rendering and signed-in toolbar avatar
- Website + Discord external buttons
- persistent foreground playback
- process-death-safe restoration of non-secret app state
- background polling suspension/resume
- notification artwork memory limits
- reconnect/backoff behavior and stale metadata rejection

These belong in the Android client and should not be blocked on website work.
