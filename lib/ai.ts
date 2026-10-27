import "server-only";

// OpenAI Chat Completions with a strict JSON schema. Model is configurable via OPENAI_MODEL.
// imageUrls are sent as low-detail images (e.g. thumbnails) alongside the text.
export async function aiJson<T>(system: string, user: string, name: string, schema: object, imageUrls: string[] = []): Promise<T> {
  const content = [
    { type: "text", text: user },
    ...imageUrls.map((url) => ({ type: "image_url", image_url: { url, detail: "low" } })),
  ];
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-5.4-mini",
      messages: [{ role: "system", content: system }, { role: "user", content }],
      response_format: { type: "json_schema", json_schema: { name, strict: true, schema } },
    }),
    signal: AbortSignal.timeout(120_000),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${body.error?.message ?? "unknown error"}`);
  const msg = body.choices[0].message;
  if (msg.refusal) throw new Error(`OpenAI refused: ${msg.refusal}`);
  return JSON.parse(msg.content) as T;
}
