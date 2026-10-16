# OneTap — card hub + SunTap Solar

NFC / OneTap cards open a **URL**. This repo is that URL’s web experience: a digital card hub that routes by trade into specialized tools.

## Tap → card → trade → tool

1. Kevin taps someone’s phone with an NFC OneTap card.
2. The phone opens the programmed URL (point it at **`/card.html`** on this Vercel deploy).
3. The visitor sees the OneTap card hub and chooses a trade.
4. **Solar** opens the existing SunTap estimator (`index.html` / `/`). Other trades open lightweight “coming soon” placeholders under `trades/`.

There is no special phone OS workflow beyond opening the link — routing is URL + web UX.

## Pages

| Path | Role |
|------|------|
| `card.html` | Post-tap landing: brand/card + trade chooser |
| `index.html` | SunTap solar estimator (Demo mode + password-gated live lookup) |
| `trades/*.html` | Placeholders: electrician, plumbing, construction, handyman |
| `api/lookup.js` | Vercel serverless lookup (Google key stays server-side) |

## Pointing the physical card

In the OneTap (or NFC) dashboard, set the card URL to your Vercel deployment’s card hub, for example:

`https://<your-vercel-domain>/card.html`

Until that URL is updated, the physical card may still open the old hosted card (e.g. `card.onetapconnect.com/...`).

## Vercel setup (secure key)

1. Import this GitHub repo in Vercel (framework: Other / no build).
2. Before Deploy, add **two** Environment Variables (Production and Preview):

| Key | Value |
|-----|--------|
| `GOOGLE_MAPS_API_KEY` | Your Google key (Geocoding API + Solar API enabled) |
| `APP_PASSWORD` | A password you invent and share with demo guests |

3. Click **Deploy**.
4. Open `/card.html` for the hub, or `/` / `index.html` for SunTap. Live solar lookup asks for the app password; **Demo mode** / `?demo=1` needs no password.

Never commit a Google API key or `APP_PASSWORD` to GitHub.
