# SunTap Solar demo (OneTap)

Single-page solar lookup demo. **Demo mode** uses sample data. **Live mode** (on Vercel) asks for a shared app password; the Google Maps API key stays in Vercel environment variables and never ships to the browser.

## Vercel setup (secure key)

1. Import this GitHub repo in Vercel (framework: Other / no build).
2. Before Deploy, add **two** Environment Variables (Production and Preview):

| Key | Value |
|-----|--------|
| `GOOGLE_MAPS_API_KEY` | Your Google key (Geocoding API + Solar API enabled) |
| `APP_PASSWORD` | A password you invent and share with demo guests |

3. Click **Deploy**.
4. Open the Vercel URL → enter address + app password → **Check solar potential**. Or use **Demo mode** / `?demo=1` with no password.

Never commit a Google API key or `APP_PASSWORD` to GitHub.
