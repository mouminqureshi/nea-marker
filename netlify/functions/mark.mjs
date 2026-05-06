export default async (request, context) => {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const apiKey = Netlify.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "ANTHROPIC_API_KEY not set" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const body = await request.json();

    const anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-beta": "max-tokens-3-5-sonnet-2024-07-15",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4000,
        stream: false,
        messages: body.messages,
      }),
    });

    const data = await anthropicResponse.json();

    if (!anthropicResponse.ok) {
      return new Response(
        JSON.stringify({ error: data?.error?.message || "Anthropic API error" }),
        { status: anthropicResponse.status, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

export const config = {
  path: "/api/mark",
  timeout: 300,
};
