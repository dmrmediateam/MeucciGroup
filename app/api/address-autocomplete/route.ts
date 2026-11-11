import { NextResponse } from "next/server";

/**
 * Server-side proxy for Google Places autocomplete so the API key is never
 * exposed to the browser. Requires GOOGLE_MAPS_API_KEY in the environment
 * (Places API (New) enabled); without it the endpoint returns empty results
 * and the address field behaves as a plain input.
 *
 * GET ?input=123 Main     -> { suggestions: [{ placeId, text }] }
 * GET ?placeId=ChIJ...    -> { address, city, zip }
 */

/*
 * Bias suggestions toward the client's market, per deployment:
 * GOOGLE_PLACES_BIAS="lat,lng[,radiusMeters]" (e.g. "26.1420,-81.7948,45000"
 * for Naples). Unset, suggestions are US-wide and unbiased.
 */
function marketBias(): { circle: { center: { latitude: number; longitude: number }; radius: number } } | undefined {
  const raw = process.env.GOOGLE_PLACES_BIAS?.split(",").map((v) => Number(v.trim()));
  if (!raw || raw.length < 2 || raw.some((v, i) => i < 2 && !Number.isFinite(v))) return undefined;
  const [latitude, longitude, radius] = raw;
  return { circle: { center: { latitude, longitude }, radius: Number.isFinite(radius) && radius! > 0 ? radius! : 45000 } };
}
const MARKET_BIAS = marketBias();

export async function GET(request: Request) {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  const { searchParams } = new URL(request.url);
  const input = searchParams.get("input")?.trim() ?? "";
  const placeId = searchParams.get("placeId")?.trim() ?? "";
  const sessionToken = searchParams.get("sessionToken")?.slice(0, 64) ?? "";

  if (!key) return NextResponse.json(placeId ? {} : { suggestions: [] });

  try {
    if (placeId) {
      const res = await fetch(
        `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}` +
          (sessionToken ? `?sessionToken=${encodeURIComponent(sessionToken)}` : ""),
        {
          headers: {
            "X-Goog-Api-Key": key,
            "X-Goog-FieldMask": "addressComponents",
          },
        },
      );
      if (!res.ok) return NextResponse.json({});
      const data = await res.json();
      const components: Array<{ types: string[]; longText?: string; shortText?: string }> =
        data.addressComponents ?? [];
      const get = (type: string) =>
        components.find((c) => c.types.includes(type))?.longText ?? "";
      const streetNumber = get("street_number");
      const route = get("route");
      return NextResponse.json({
        address: [streetNumber, route].filter(Boolean).join(" "),
        city: get("locality") || get("sublocality") || get("postal_town"),
        zip: get("postal_code"),
      });
    }

    if (input.length < 3) return NextResponse.json({ suggestions: [] });

    const res = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Goog-Api-Key": key },
      body: JSON.stringify({
        input,
        includedRegionCodes: ["us"],
        includedPrimaryTypes: ["street_address", "premise", "subpremise"],
        ...(MARKET_BIAS ? { locationBias: MARKET_BIAS } : {}),
        ...(sessionToken ? { sessionToken } : {}),
      }),
    });
    if (!res.ok) return NextResponse.json({ suggestions: [] });
    const data = await res.json();
    const suggestions = (data.suggestions ?? [])
      .map((s: { placePrediction?: { placeId: string; text?: { text: string } } }) => ({
        placeId: s.placePrediction?.placeId ?? "",
        text: s.placePrediction?.text?.text ?? "",
      }))
      .filter((s: { placeId: string; text: string }) => s.placeId && s.text)
      .slice(0, 5);
    return NextResponse.json({ suggestions });
  } catch {
    return NextResponse.json(placeId ? {} : { suggestions: [] });
  }
}
