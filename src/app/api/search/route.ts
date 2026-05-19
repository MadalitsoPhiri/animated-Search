import { NextRequest, NextResponse } from "next/server";

type SearchResult = {
  title: string;
  url: string;
  description: string;
};

const MAX_RESULTS = 5;

function decodeHtmlEntities(input: string): string {
  return input
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number.parseInt(code, 10)))
    .replace(/&#x([\da-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function cleanResultText(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }

  const withoutTags = value.replace(/<[^>]*>/g, " ");
  const decoded = decodeHtmlEntities(withoutTags);

  return decoded.replace(/\s+/g, " ").trim();
}

async function searchWithBrave(query: string, key: string): Promise<SearchResult[]> {
  const url = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=${MAX_RESULTS}`;

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "X-Subscription-Token": key
    },
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Brave API error (${response.status})`);
  }

  const data = await response.json();
  const results = data?.web?.results ?? [];

  return results.map((item: any) => ({
    title: cleanResultText(item.title) || "Untitled",
    url: item.url ?? "",
    description: cleanResultText(item.description)
  }));
}

async function searchWithTavily(query: string, key: string): Promise<SearchResult[]> {
  const response = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      api_key: key,
      query,
      max_results: MAX_RESULTS
    }),
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Tavily API error (${response.status})`);
  }

  const data = await response.json();
  const results = data?.results ?? [];

  return results.map((item: any) => ({
    title: cleanResultText(item.title) || "Untitled",
    url: item.url ?? "",
    description: cleanResultText(item.content)
  }));
}

function buildSummary(query: string, results: SearchResult[]) {
  if (results.length === 0) {
    return `No results found for "${query}".`;
  }

  return `Found ${results.length} live web result${results.length > 1 ? "s" : ""} for "${query}".`;
}

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (typeof query !== "string" || query.trim().length < 2) {
      return NextResponse.json(
        { error: "Please provide a search query with at least 2 characters." },
        { status: 400 }
      );
    }

    const provider = (process.env.SEARCH_PROVIDER || "brave").toLowerCase();
    const key = process.env.SEARCH_API_KEY;

    if (!key) {
      return NextResponse.json(
        {
          error:
            "Missing SEARCH_API_KEY. Add it to .env.local before running searches."
        },
        { status: 500 }
      );
    }

    const cleanQuery = query.trim();
    const results =
      provider === "tavily"
        ? await searchWithTavily(cleanQuery, key)
        : await searchWithBrave(cleanQuery, key);

    return NextResponse.json({
      provider,
      summary: buildSummary(cleanQuery, results),
      results: results.filter((item) => item.url).slice(0, MAX_RESULTS)
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown search error";

    return NextResponse.json(
      {
        error: `Search request failed: ${message}`
      },
      { status: 500 }
    );
  }
}
