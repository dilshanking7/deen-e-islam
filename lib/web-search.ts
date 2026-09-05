export interface WebResult {
  title: string;
  text: string;
  url: string;
  source: string;
}

function truncate(s: string, n: number): string {
  if (s.length <= n) return s;
  return s.slice(0, n).replace(/\s+\S*$/, "") + "…";
}

async function getJson(url: string, timeout = 9000): Promise<Record<string, unknown> | null> {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(timeout),
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    return (await res.json()) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function searchWeb(query: string): Promise<WebResult | null> {
  const q = encodeURIComponent(query.trim());

  // 1) DuckDuckGo Instant Answer (no key, CORS-friendly)
  const ddg = await getJson(
    `https://api.duckduckgo.com/?q=${q}&format=json&no_html=1&skip_disambig=1&t=islaam-e-deen`
  );
  if (ddg) {
    const abs = (ddg.AbstractText as string) || "";
    if (abs.trim().length > 40) {
      const results = ddg.RelatedTopics as Array<{ FirstURL?: string; Text?: string }> | undefined;
      const firstUrl =
        (ddg.AbstractURL as string) || results?.[0]?.FirstURL || `https://duckduckgo.com/?q=${q}`;
      return {
        title: (ddg.Heading as string) || (ddg.AbstractTitle as string) || query,
        text: truncate(abs, 320),
        url: firstUrl,
        source: "DuckDuckGo",
      };
    }
  }

  // 2) Wikipedia search + summary (no key, CORS-friendly)
  const wiki = await getJson(
    `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${q}&format=json&origin=*&srlimit=1`
  );
  const hit = ((wiki?.query as { search?: Array<{ title?: string }> } | undefined)?.search || [])[0];
  if (hit?.title) {
    const summary = await getJson(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(hit.title)}`
    );
    const extract = (summary?.extract as string) || "";
    if (extract.trim().length > 60) {
      return {
        title: (summary?.title as string) || hit.title,
        text: truncate(extract, 320),
        url:
          (summary?.content_urls as { desktop?: { page?: string } } | undefined)?.desktop?.page ||
          `https://en.wikipedia.org/wiki/${encodeURIComponent(hit.title)}`,
        source: "Wikipedia",
      };
    }
  }

  return null;
}