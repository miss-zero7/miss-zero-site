const allowedOrigins = new Set([
  "https://misszero.xyz",
  "https://www.misszero.xyz",
  "https://miss-zero7.github.io",
]);

Deno.serve(async (request) => {
  const origin = request.headers.get("origin");
  if (!origin || !allowedOrigins.has(origin)) {
    return new Response(null, { status: 403 });
  }

  const headers = {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Cache-Control": "no-store",
    "Vary": "Origin",
  };
  const reply = (status: number) => new Response(null, { status, headers });

  if (request.method === "OPTIONS") return reply(204);
  if (request.method !== "POST") return reply(405);
  if (request.headers.get("content-type")?.split(";")[0] !== "application/json") return reply(415);
  if (Number(request.headers.get("content-length")) > 128) return reply(413);

  let wallet: string;
  try {
    const raw = await request.text();
    if (raw.length > 128) return reply(413);
    const body = JSON.parse(raw);
    if (Object.keys(body).length !== 1 || typeof body.wallet !== "string" ||
        !/^0x[0-9a-f]{40}$/i.test(body.wallet)) return reply(400);
    wallet = body.wallet.toLowerCase();
  } catch {
    return reply(400);
  }

  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) return reply(503);

  try {
    const result = await fetch(new URL("/rest/v1/giveaway_wallets", url), {
      method: "POST",
      headers: {
        "apikey": key,
        "Authorization": `Bearer ${key}`,
        "Content-Type": "application/json",
        "Prefer": "resolution=ignore-duplicates,return=minimal",
      },
      body: JSON.stringify({ wallet }),
      signal: AbortSignal.timeout(8000),
    });
    return reply(result.ok ? 204 : 503);
  } catch {
    return reply(503);
  }
});
