/**
 * Server-side solar lookup.
 * Google API key stays in Vercel env (GOOGLE_MAPS_API_KEY).
 * Callers must send APP_PASSWORD (also from Vercel env).
 */
const GEOCODE_URL = "https://maps.googleapis.com/maps/api/geocode/json";
const SOLAR_URL = "https://solar.googleapis.com/v1/buildingInsights:findClosest";

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

function timingSafeEqual(a, b) {
  const left = Buffer.from(String(a || ""), "utf8");
  const right = Buffer.from(String(b || ""), "utf8");
  if (left.length !== right.length) return false;
  return require("crypto").timingSafeEqual(left, right);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      try {
        const raw = Buffer.concat(chunks).toString("utf8");
        resolve(raw ? JSON.parse(raw) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", reject);
  });
}

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.end();
    return;
  }

  if (req.method !== "POST") {
    return json(res, 405, { error: "Use POST with JSON { address, password }" });
  }

  const googleKey = process.env.GOOGLE_MAPS_API_KEY;
  const appPassword = process.env.APP_PASSWORD;

  if (!googleKey || !appPassword) {
    return json(res, 503, {
      error: "Server is missing GOOGLE_MAPS_API_KEY or APP_PASSWORD. Add them in Vercel → Settings → Environment Variables."
    });
  }

  let body;
  try {
    body = await readBody(req);
  } catch (_) {
    return json(res, 400, { error: "Invalid JSON body" });
  }

  const address = String(body.address || "").trim();
  const password = String(body.password || "");

  if (!timingSafeEqual(password, appPassword)) {
    return json(res, 401, { error: "Wrong password" });
  }

  if (!address) {
    return json(res, 400, { error: "Enter a street address" });
  }

  try {
    const geoUrl =
      `${GEOCODE_URL}?address=${encodeURIComponent(address)}` +
      `&key=${encodeURIComponent(googleKey)}`;
    const geoRes = await fetch(geoUrl);
    const geoData = await geoRes.json();

    if (geoData.status !== "OK" || !geoData.results || !geoData.results.length) {
      const msg = geoData.error_message || geoData.status || "Geocoding failed";
      return json(res, 400, { error: "Geocoding: " + msg });
    }

    const best = geoData.results[0];
    const lat = best.geometry.location.lat;
    const lng = best.geometry.location.lng;

    const solarUrl =
      `${SOLAR_URL}?location.latitude=${encodeURIComponent(lat)}` +
      `&location.longitude=${encodeURIComponent(lng)}` +
      `&requiredQuality=HIGH` +
      `&key=${encodeURIComponent(googleKey)}`;
    const solarRes = await fetch(solarUrl);
    const solarData = await solarRes.json().catch(() => ({}));

    if (!solarRes.ok) {
      const msg = (solarData.error && solarData.error.message) || solarRes.statusText;
      return json(res, solarRes.status, { error: "Solar API: " + msg });
    }

    return json(res, 200, {
      addressLabel: best.formatted_address,
      insights: solarData
    });
  } catch (err) {
    return json(res, 500, { error: err.message || "Lookup failed" });
  }
};
