# RRN Mobile v0.4 — Device Test Checklist

Use this checklist on a real Android phone after installing the v0.4 Website-Parity Alpha. Record failures with screen, action, expected result, actual result, Android version/device, and whether Wi-Fi/cellular/Bluetooth was active.

## Account

- Native RRN sign-in accepts the same account credentials as RealityRadio.net.
- Closing/reopening the app restores the authenticated session without re-entering the password.
- Refresh token/session restoration works after access-token expiry.
- Sign out removes local app session tokens.
- Account role/permissions match the website.

## Reality Dial

- PFL, RMP, TFP, PFH, and ASHP each load their own frequency space.
- Dragging the scale changes numeric frequency continuously rather than jumping station-to-station.
- TUNE knob changes frequency continuously.
- Dead frequency remains selectable.
- With Static ON, dead space produces generated radio static.
- With Static OFF, dead space is silent without changing tuner behavior.
- Signal Bleed ON mixes a nearby receivable station gradually as the dial approaches its frequency.
- Signal Bleed OFF locks audio only within the station lock threshold.
- Dial Audio AUTO starts/changes station audio when crossing/locking a receivable station.
- Dial Audio MANUAL preserves tuner movement but does not automatically switch playback.
- SCAN traverses the band and stops on a receivable stream, not a coming-soon/non-stream listing.
- Previous/Next seeks previous/next listed frequency correctly.
- Coming Soon station remains visible at its frequency while behaving as non-receivable if it has no stream.
- Station metadata updates without knocking the tuner off frequency.
- Station Page opens from the tuned station card.

## Station Directory / Search

Search for examples of:

- exact station name
- partial station name
- numeric frequency such as `201.5`
- designation such as `201.5 RMP`
- band such as `RMP`
- genre such as `rock`
- keyword/tag
- description/tagline text
- location/market where present

Verify filters for:

- band
- live
- coming soon
- testing
- off air

Verify station previews show the website-provided status and metadata for live and future listings.

## Saved Stations

- Save an unlimited number of stations.
- Add an optional nickname.
- Rename a saved station later.
- Official station name/metadata remains distinct from user nickname.
- Filter saved stations by band.
- Remove a saved station.
- Signed-in saved-state sync does not erase local nicknames unexpectedly.

## Presets

Each band must have a separate six-slot bank.

- Save PFL preset 1.
- Save RMP preset 1 to a different station.
- Switch between PFL/RMP and verify both preset 1 values remain independent.
- Repeat across all bands as practical.
- Recall preset.
- Replace preset.
- Customize preset label.
- Clear preset.
- Confirm preset stores band + exact frequency and station id where available.

## Radio Background / System Media

Start a real station stream, then:

- switch to another tab inside RRN Mobile
- switch to another Android app
- return to home screen
- turn screen off
- turn screen back on
- lock/unlock phone

Audio must continue unless Android/user explicitly stops it.

Verify:

- media notification appears
- notification Play/Pause works
- lock-screen Play/Pause works
- notification/lock screen show useful station metadata
- Bluetooth/headset Play/Pause works
- disconnect/reconnect Bluetooth behaves sensibly
- incoming audio-focus interruption pauses/ducks appropriately and recovers appropriately
- mini-player inside app stays synchronized with system playback
- Stop closes current playback cleanly

## RRN Music Catalog

Without signing in:

- Albums/releases render.
- Singles/tracks render.
- Artists render.
- Music search filters catalog.
- Album detail opens.
- Embedded/fetched tracklist renders.
- Track preview plays when a preview/stream URL exists.
- Artist page shows matching releases/tracks.
- Store link/surface remains reachable for unowned content.

Signed in:

- Owned/purchased items are visibly identified when entitlement Matrix data is available.
- Owned and unowned content appear in the same catalog rather than separate incomplete catalogs.
- Library and Purchases remain reachable.

## Music Background / System Media

Start a music preview/stream and repeat the background/system-media tests used for radio.

Verify:

- artwork/title/artist on notification
- lock-screen metadata
- Play/Pause
- seek from in-app Now Playing
- phone screen off playback
- switching apps does not kill playback

## Station Page

Open a station from:

- Dial
- Directory
- Search
- Saved Stations

Verify native station information includes everything returned by the station object, with access to:

- live metadata
- description/tagline
- frequency/designation/band
- status
- genres/formats/tags
- location
- presenters where provided
- Listen
- Save
- Schedule
- Feed
- Shows
- Presenters
- Charts
- Events
- Giveaways
- Requests
- Call-ins
- management/tools when account permissions allow

Missing native Matrix endpoints may show a clear pending/fallback state but must not fake success.

## Reality Charts

- Chart list renders.
- Chart detail/rankings render.
- Nomination requires/authenticates account.
- Vote requires/authenticates account.
- Vote result reloads.
- Create Chart native form opens.
- Create Chart submits to the native Matrix when the backend route is available.
- My Charts / Manage surfaces remain reachable.
- Owner/staff management is only shown when authorized by server data.

## Connect / Social

After the Social Matrix backend lands:

- feed renders the same RRN social data as the website
- compose post
- reactions
- comments
- messages
- friends/connections
- events
- notifications
- profiles
- account privacy/permission state

Before the backend lands, app must identify the bridge as pending rather than creating fake local social state.

## RRN Points

After points backend lands:

- wallet balance matches website/bot balance
- ledger matches
- no negative balance
- verified listening awards at configured rate (currently 10 points/hour)
- eligible `$0.99` item can quote at `99 points`
- split-tender quote works where permitted
- song request/shoutout holds points before external action and commits/refunds correctly
- direct point-purchase checkout is server-authoritative

## Automotive foundation

- Android recognizes RRN as a media app.
- phone media session remains available when connected to a compatible vehicle/head unit.
- Play/Pause hardware commands affect RRN audio.
- system volume remains system/vehicle controlled.

Full Android Auto browse-tree testing will be added when the native automotive catalog/session implementation is expanded.
