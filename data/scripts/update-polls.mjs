import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const ROOT = process.cwd();
const MANIFEST_PATH = join(ROOT, "data", "source-manifest.json");
const MANUAL_POLLS_PATH = join(ROOT, "data", "manual-polls.json");
const OUTPUT_PATH = join(ROOT, "public", "data", "polls.json");
const OFFLINE_MODE = process.argv.includes("--offline");
const X_MIRROR_PREFIX = "https://r.jina.ai/http://x.com/";

const PARTY_ALIASES = {
  dmk: ["DMK", "DMK alliance", "DMK-led alliance", "DMK+"],
  bjpAlliance: [
    "BJP alliance",
    "BJP-led alliance",
    "NDA",
    "NDA alliance",
    "AIADMK-BJP alliance",
    "AIADMK-led alliance",
    "AIADMK alliance",
    "AIADMK+"
  ],
  tvk: ["TVK", "Vijay's TVK", "Tamizhaga Vettri Kazhagam", "Tamilaga Vettri Kazhagam"],
  aiadmk: ["AIADMK", "AIADMK-led", "AIADMK party"]
};

const LOCAL_SOURCE_PATTERNS = [
  /thanthitv/i,
  /news7tamil/i,
  /puthiyathalaimurai/i,
  /tv9tamil/i,
  /polimer/i,
  /dtnext/i,
  /dinamani/i,
  /sathiyam/i,
  /sunnews/i,
  /rajnews/i,
  /ibctamil/i,
  /newstamil/i,
  /malaimurasu/i,
  /news18tamil/i,
  /tamil\.news18/i,
  /news9live/i
];

function loadJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function ensureDirectory(path) {
  mkdirSync(dirname(path), { recursive: true });
}

function safeReadOutput() {
  try {
    return loadJson(OUTPUT_PATH);
  } catch {
    return null;
  }
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function decodeHtml(text = "") {
  return String(text)
    .replace(/<!\[CDATA\[|\]\]>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&ndash;|&mdash;/g, "-")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/Ã¢â‚¬â„¢|Ã¢â‚¬Ëœ|Ã¢â‚¬Â²|ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢|ÃƒÂ¢Ã¢â€šÂ¬Ã‹Å“/g, "'")
    .replace(/Ã¢â‚¬Å“|Ã¢â‚¬Â|ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œ|ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â/g, '"')
    .replace(/Ã¢â‚¬â€œ|Ã¢â‚¬â€|Ã¢Ë†â€™|ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“|ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â/g, "-")
    .replace(/Ã¢â‚¬Â¦|ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦/g, "...")
    .replace(/Ã‚|Ãƒâ€š/g, "");
}

function stripTags(html = "") {
  return decodeHtml(
    String(html)
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
      .replace(/<[^>]+>/g, " ")
  ).replace(/\s+/g, " ").trim();
}

function stripMarkdownLinks(text = "") {
  return text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
}

function getDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function isAllowedDomain(domain, manifest) {
  return manifest.allowedDomains.some((allowedDomain) => domain === allowedDomain || domain.endsWith(`.${allowedDomain}`));
}

function buildFeedUrls(query) {
  const encoded = encodeURIComponent(query);
  return [
    {
      provider: "google-news",
      url: `https://news.google.com/rss/search?q=${encoded}&hl=en-IN&gl=IN&ceid=IN:en`
    },
    {
      provider: "bing-news",
      url: `https://www.bing.com/news/search?q=${encoded}&format=rss`
    }
  ];
}

function buildXMirrorUrl(handle) {
  return `${X_MIRROR_PREFIX}${handle}`;
}

function resolveFeedLink(rawLink) {
  const link = decodeHtml(rawLink);

  try {
    const parsed = new URL(link);
    const hostname = parsed.hostname.replace(/^www\./, "");

    if (hostname.endsWith("bing.com") && parsed.pathname.includes("/news/apiclick.aspx")) {
      const targetUrl = parsed.searchParams.get("url");
      if (targetUrl) {
        return decodeURIComponent(targetUrl);
      }
    }

    return link;
  } catch {
    return link;
  }
}

async function fetchText(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  try {
    const response = await fetch(url, {
      redirect: "follow",
      headers: {
        "user-agent": "tn-2026-poll-tracker/1.1",
        accept: "text/html,application/xhtml+xml,application/xml,text/xml;q=0.9,*/*;q=0.8"
      },
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    return {
      finalUrl: response.url,
      body: await response.text(),
      contentType: response.headers.get("content-type") || ""
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function validateUrl(url, mode = "live") {
  try {
    const response = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      headers: {
        "user-agent": "tn-2026-poll-tracker/1.1"
      }
    });

    return {
      ok: response.ok,
      statusCode: response.status,
      checkedAt: new Date().toISOString(),
      mode
    };
  } catch {
    return {
      ok: false,
      statusCode: null,
      checkedAt: new Date().toISOString(),
      mode
    };
  }
}

function parseRssItems(xml, provider) {
  const items = [];
  const matches = xml.match(/<item>([\s\S]*?)<\/item>/gi) || [];

  for (const rawItem of matches) {
    const extract = (pattern) => {
      const match = rawItem.match(pattern);
      return match ? decodeHtml(match[1]).trim() : "";
    };

    const title = extract(/<title>([\s\S]*?)<\/title>/i);
    const link = resolveFeedLink(extract(/<link>([\s\S]*?)<\/link>/i));
    const pubDate = extract(/<pubDate>([\s\S]*?)<\/pubDate>/i);
    const description = extract(/<description>([\s\S]*?)<\/description>/i);
    const sourceName =
      extract(/<News:Source>([\s\S]*?)<\/News:Source>/i) ||
      extract(/<source[^>]*>([\s\S]*?)<\/source>/i);
    const sourceUrl = extract(/<source[^>]*url="([^"]+)"/i);

    if (!title || !link) {
      continue;
    }

    items.push({
      provider,
      title,
      link,
      pubDate,
      description: stripTags(description),
      sourceName,
      sourceUrl: resolveFeedLink(sourceUrl)
    });
  }

  return items;
}

function normalizeMetric(metric, suffix = "") {
  if (metric === null || metric === undefined) {
    return null;
  }

  if (typeof metric === "object" && "value" in metric) {
    return metric;
  }

  return {
    value: Number(metric),
    display: suffix ? `${metric}${suffix}` : String(metric)
  };
}

function normalizePoll(poll) {
  const sourceUrl = poll.sourceUrl || poll.link || "";
  const sourceDomain = poll.sourceDomain || getDomain(sourceUrl);
  const normalized = {
    ...poll,
    id:
      poll.id ||
      slugify([
        poll.pollster,
        poll.pollDate || poll.publishedAt?.slice(0, 10),
        sourceDomain,
        sourceUrl
      ].join("-")),
    sourceUrl,
    sourceDomain,
    seatProjection: {
      dmk: normalizeMetric(poll.seatProjection?.dmk),
      bjpAlliance: normalizeMetric(poll.seatProjection?.bjpAlliance),
      tvk: normalizeMetric(poll.seatProjection?.tvk),
      aiadmk: normalizeMetric(poll.seatProjection?.aiadmk)
    },
    voteShare: {
      dmk: normalizeMetric(poll.voteShare?.dmk, "%"),
      bjpAlliance: normalizeMetric(poll.voteShare?.bjpAlliance, "%"),
      tvk: normalizeMetric(poll.voteShare?.tvk, "%"),
      aiadmk: normalizeMetric(poll.voteShare?.aiadmk, "%")
    },
    confidence: poll.confidence || "auto"
  };

  normalized.sortDate = normalized.publishedAt || normalized.pollDate || "";
  return normalized;
}

function pickPollster(text, manifest) {
  for (const pollster of manifest.pollsters) {
    if (pollster.aliases.some((alias) => text.toLowerCase().includes(alias.toLowerCase()))) {
      return pollster.name;
    }
  }
  return null;
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function aliasPattern(alias) {
  return `(?<![A-Za-z])${escapeRegex(alias)}(?![A-Za-z])`;
}

function createMetric(match) {
  if (!match) {
    return null;
  }

  const start = Number(match[1]);
  const end = match[2] ? Number(match[2]) : null;
  const value = end === null ? start : Number(((start + end) / 2).toFixed(2));
  const display = end === null ? `${start}` : `${start}-${end}`;

  return {
    value,
    display
  };
}

function isHistoricalSnippet(text, index) {
  const start = Math.max(0, index - 100);
  const end = Math.min(text.length, index + 100);
  const snippet = text.slice(start, end);
  return /(2016|2019|2021|2024)/.test(snippet) && /(election|elections|assembly|lok sabha|won|secured|victory)/i.test(snippet) && !/2026/.test(snippet);
}

function extractPercent(text, aliases) {
  for (const alias of aliases) {
    const pattern = new RegExp(
      `${aliasPattern(alias)}[^.%\\d]{0,60}(\\d{1,3}(?:\\.\\d+)?)(?:\\s*[-â€“]\\s*(\\d{1,3}(?:\\.\\d+)?))?\\s*(?:%|per\\s+cent|percent)`,
      "gi"
    );

    for (const match of text.matchAll(pattern)) {
      if (isHistoricalSnippet(text, match.index || 0)) {
        continue;
      }
      const metric = createMetric(match);
      if (metric) {
        return {
          value: metric.value,
          display: `${metric.display}%`
        };
      }
    }
  }

  return null;
}

function extractSeats(text, aliases) {
  for (const alias of aliases) {
    const pattern = new RegExp(
      `${aliasPattern(alias)}[^\\d]{0,60}(\\d{1,3})(?:\\s*[-â€“]\\s*(\\d{1,3}))?\\s+seats?`,
      "gi"
    );

    for (const match of text.matchAll(pattern)) {
      if (isHistoricalSnippet(text, match.index || 0)) {
        continue;
      }
      return createMetric(match);
    }
  }

  return null;
}

function extractMetaContent(html, key) {
  const patterns = [
    new RegExp(`<meta[^>]+name=["']${escapeRegex(key)}["'][^>]+content=["']([^"']+)["']`, "i"),
    new RegExp(`<meta[^>]+property=["']${escapeRegex(key)}["'][^>]+content=["']([^"']+)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${escapeRegex(key)}["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${escapeRegex(key)}["']`, "i")
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) {
      return decodeHtml(match[1]).trim();
    }
  }

  return "";
}

function extractDescriptionMeta(html) {
  const candidates = [
    extractMetaContent(html, "description"),
    extractMetaContent(html, "og:description"),
    extractMetaContent(html, "twitter:description")
  ].filter(Boolean);

  return candidates[0] || "";
}

function isPollLike(text) {
  return /(tamil nadu|tamilnadu)/i.test(text) && /(survey|opinion poll|pre poll|tracker|state vibe|vote vibe|parawheel|c-voter|axis my india|matrize|ians|loyola|ipds|channel survey|tv survey|karuthu)/i.test(text);
}

function countSignals(poll) {
  let count = 0;
  for (const metricGroup of [poll.seatProjection, poll.voteShare]) {
    for (const metric of Object.values(metricGroup)) {
      if (metric && typeof metric.value === "number" && Number.isFinite(metric.value)) {
        count += 1;
      }
    }
  }
  return count;
}

function isCandidateItemLikelyPoll(item, manifest) {
  const previewText = [item.title, item.description, item.sourceName].filter(Boolean).join(" ");
  const hintedDomain = getDomain(item.sourceUrl || item.link);
  const hintedPollster = pickPollster(previewText, manifest);

  return isPollLike(previewText) && (!hintedDomain || isAllowedDomain(hintedDomain, manifest) || Boolean(hintedPollster));
}

function buildFocusedArticleText(item, metaDescription, visibleText) {
  const anchors = [item.title, metaDescription].filter(Boolean);

  for (const anchor of anchors) {
    const normalizedAnchor = stripTags(anchor).slice(0, 120);
    const startIndex = normalizedAnchor ? visibleText.indexOf(normalizedAnchor) : -1;
    if (startIndex >= 0) {
      return visibleText.slice(startIndex, startIndex + 5000);
    }
  }

  return visibleText.slice(0, 5000);
}

function removeHistoricalContext(text = "") {
  return text
    .split(/(?<=[.!?])\s+/)
    .filter((sentence) => !( /(2016|2019|2021|2024)/.test(sentence) && /(election|elections|assembly|lok sabha|won|secured|victory)/i.test(sentence) && !/2026/.test(sentence) ))
    .join(" ");
}

function looksHistoricalOnly(text = "") {
  return /(2016|2019|2021|2024)/.test(text) && /(election|elections|assembly|lok sabha|won|secured|victory)/i.test(text) && !/2026/.test(text);
}

function classifySourceCategory(sourceDomain) {
  return LOCAL_SOURCE_PATTERNS.some((pattern) => pattern.test(sourceDomain)) ? "local" : "national";
}

function cleanXPostText(text = "", source) {
  const lines = stripMarkdownLinks(text)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const cleaned = [];

  for (const line of lines) {
    if (
      line === "Â·" ||
      line === source.name ||
      line === `@${source.handle}` ||
      /^(\d+:\d+|\d+[KMB]?)$/i.test(line) ||
      /^(Show more|ALT|GIF|Quote|Reply|Posts|Follow)$/i.test(line)
    ) {
      continue;
    }
    if (/^https?:\/\/t\.co\//i.test(line)) {
      continue;
    }
    cleaned.push(line);
  }

  return cleaned.join(" ").replace(/\s+/g, " ").trim();
}

function parseXProfilePosts(markdown, source) {
  const items = [];
  const statusRegex = /\[([A-Z][a-z]{2}\s+\d{1,2},\s+\d{4})\]\(http:\/\/x\.com\/([^/]+)\/status\/(\d+)\)/g;
  const matches = [...markdown.matchAll(statusRegex)];

  for (let index = 0; index < matches.length; index += 1) {
    const match = matches[index];
    const nextMatch = matches[index + 1];
    const start = match.index + match[0].length;
    const end = nextMatch ? nextMatch.index : markdown.length;
    const postText = cleanXPostText(markdown.slice(start, end), source);

    if (!postText) {
      continue;
    }

    items.push({
      provider: "x-profile",
      title: postText.slice(0, 180),
      link: `https://x.com/${match[2]}/status/${match[3]}`,
      pubDate: match[1],
      description: postText,
      sourceName: `${source.name} on X`,
      sourceUrl: `https://x.com/${match[2]}/status/${match[3]}`,
      sourceHandle: source.handle,
      sourceCategory: source.category || "national"
    });
  }

  return items;
}

async function buildPollFromItem(item, manifest) {
  const resolved = await fetchText(item.link);
  const sourceUrl = resolved.finalUrl || item.link;
  const hintedSourceUrl = item.sourceUrl || sourceUrl;
  const sourceDomain = getDomain(hintedSourceUrl);
  const resolvedDomain = getDomain(sourceUrl);

  if (item.provider === "google-news" && resolvedDomain === "news.google.com") {
    return null;
  }

  if (!isAllowedDomain(sourceDomain, manifest)) {
    return null;
  }

  if (/application\/pdf/i.test(resolved.contentType) || /\.pdf(?:$|\?)/i.test(sourceUrl)) {
    return null;
  }

  const visibleText = stripTags(resolved.body);
  const rawMetaDescription = extractDescriptionMeta(resolved.body);
  const metaDescription = looksHistoricalOnly(rawMetaDescription) ? "" : removeHistoricalContext(rawMetaDescription);
  const focusedText = removeHistoricalContext(buildFocusedArticleText(item, metaDescription, visibleText));
  const combinedText = removeHistoricalContext(
    [item.title, item.description, metaDescription, focusedText].filter(Boolean).join(" ")
  );

  if (!isPollLike(combinedText)) {
    return null;
  }

  const validation = await validateUrl(sourceUrl, "live");
  if (!validation.ok) {
    return null;
  }

  const seatProjection = {
    dmk: extractSeats(combinedText, PARTY_ALIASES.dmk),
    bjpAlliance: extractSeats(combinedText, PARTY_ALIASES.bjpAlliance),
    tvk: extractSeats(combinedText, PARTY_ALIASES.tvk),
    aiadmk: extractSeats(combinedText, PARTY_ALIASES.aiadmk)
  };
  const voteShare = {
    dmk: extractPercent(combinedText, PARTY_ALIASES.dmk),
    bjpAlliance: extractPercent(combinedText, PARTY_ALIASES.bjpAlliance),
    tvk: extractPercent(combinedText, PARTY_ALIASES.tvk),
    aiadmk: extractPercent(combinedText, PARTY_ALIASES.aiadmk)
  };

  if (looksHistoricalOnly(rawMetaDescription)) {
    seatProjection.dmk = null;
    seatProjection.bjpAlliance = null;
    seatProjection.tvk = null;
    seatProjection.aiadmk = null;
  }

  const poll = normalizePoll({
    pollDate: item.pubDate ? new Date(item.pubDate).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
    publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    pollster: pickPollster(combinedText, manifest) || item.sourceName || "Unattributed Survey",
    sourceName: item.sourceName || sourceDomain,
    sourceCategory: classifySourceCategory(sourceDomain),
    sourceUrl: hintedSourceUrl || sourceUrl,
    sourceDomain,
    headline: item.title,
    summary: metaDescription || item.description || item.title,
    seatProjection,
    voteShare,
    notes: "Auto-discovered from scheduled feed ingestion. Review alliance labels before republishing if a story only reports combined blocs.",
    validation,
    discovery: {
      method: item.provider,
      query: item.query || "",
      feedLink: item.link
    },
    confidence: "auto"
  });

  return countSignals(poll) >= 1 ? poll : null;
}

function buildPollFromXItem(item, manifest) {
  const combinedText = removeHistoricalContext([item.title, item.description].filter(Boolean).join(" "));

  if (!isPollLike(combinedText)) {
    return null;
  }

  const poll = normalizePoll({
    pollDate: item.pubDate ? new Date(item.pubDate).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
    publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    pollster: pickPollster(combinedText, manifest) || item.sourceName || "X Poll Source",
    sourceName: item.sourceName,
    sourceCategory: item.sourceCategory || "national",
    sourceUrl: item.sourceUrl,
    sourceDomain: "x.com",
    headline: item.title,
    summary: item.description.slice(0, 280),
    seatProjection: {
      dmk: extractSeats(combinedText, PARTY_ALIASES.dmk),
      bjpAlliance: extractSeats(combinedText, PARTY_ALIASES.bjpAlliance),
      tvk: extractSeats(combinedText, PARTY_ALIASES.tvk),
      aiadmk: extractSeats(combinedText, PARTY_ALIASES.aiadmk)
    },
    voteShare: {
      dmk: extractPercent(combinedText, PARTY_ALIASES.dmk),
      bjpAlliance: extractPercent(combinedText, PARTY_ALIASES.bjpAlliance),
      tvk: extractPercent(combinedText, PARTY_ALIASES.tvk),
      aiadmk: extractPercent(combinedText, PARTY_ALIASES.aiadmk)
    },
    notes: `Auto-discovered from the official X handle @${item.sourceHandle}.`,
    validation: {
      ok: true,
      statusCode: 200,
      checkedAt: new Date().toISOString(),
      mode: "x-mirror"
    },
    discovery: {
      method: item.provider,
      query: `@${item.sourceHandle}`,
      feedLink: item.link
    },
    confidence: "medium"
  });

  return countSignals(poll) >= 1 ? poll : null;
}

function dedupePolls(polls) {
  const seen = new Map();

  for (const poll of polls) {
    const key = [poll.pollster, poll.pollDate, poll.sourceUrl || poll.sourceDomain].join("|");

    if (!seen.has(key)) {
      seen.set(key, poll);
    }
  }

  return Array.from(seen.values()).sort((left, right) => new Date(right.sortDate || 0).getTime() - new Date(left.sortDate || 0).getTime());
}

async function discoverPolls(manifest) {
  const discoveredItems = [];
  const feedErrors = [];

  for (const query of manifest.queries) {
    for (const feed of buildFeedUrls(query)) {
      try {
        const response = await fetchText(feed.url);
        const items = parseRssItems(response.body, feed.provider).map((item) => ({ ...item, query }));
        discoveredItems.push(...items);
      } catch (error) {
        feedErrors.push({
          query,
          feed: feed.provider,
          message: error instanceof Error ? error.message : "Unknown feed error"
        });
      }
    }
  }

  const candidateItems = [];
  const seenLinks = new Set();

  for (const item of discoveredItems.filter((candidate) => isCandidateItemLikelyPoll(candidate, manifest))) {
    if (seenLinks.has(item.link)) {
      continue;
    }
    seenLinks.add(item.link);
    candidateItems.push(item);
  }

  const polls = [];
  const articleErrors = [];

  for (const item of candidateItems.slice(0, 100)) {
    try {
      const poll = await buildPollFromItem(item, manifest);
      if (poll) {
        polls.push(poll);
      }
    } catch (error) {
      articleErrors.push({
        link: item.link,
        title: item.title,
        message: error instanceof Error ? error.message : "Unknown article error"
      });
    }
  }

  return {
    polls,
    feedErrors,
    articleErrors,
    articlesScanned: candidateItems.length
  };
}

async function discoverXPolls(manifest) {
  const polls = [];
  const sourceFailures = [];
  let postsScanned = 0;

  for (const source of manifest.xSources || []) {
    try {
      const response = await fetchText(buildXMirrorUrl(source.handle));
      const items = parseXProfilePosts(response.body, source);
      postsScanned += items.length;

      for (const item of items.slice(0, 12)) {
        try {
          const poll = buildPollFromXItem(item, manifest);
          if (poll) {
            polls.push(poll);
          }
        } catch (error) {
          sourceFailures.push({
            handle: source.handle,
            link: item.link,
            message: error instanceof Error ? error.message : "Unknown X item error"
          });
        }
      }
    } catch (error) {
      sourceFailures.push({
        handle: source.handle,
        link: buildXMirrorUrl(source.handle),
        message: error instanceof Error ? error.message : "Unknown X source error"
      });
    }
  }

  return {
    polls,
    sourceFailures,
    postsScanned
  };
}

async function main() {
  const manifest = loadJson(MANIFEST_PATH);
  const manualPolls = loadJson(MANUAL_POLLS_PATH).map(normalizePoll);
  const previousSnapshot = safeReadOutput();
  const previousPolls = (previousSnapshot?.polls || []).map(normalizePoll);
  const now = new Date().toISOString();

  let liveDiscovery = {
    polls: [],
    feedErrors: [],
    articleErrors: [],
    articlesScanned: 0,
    xPolls: [],
    xFailures: [],
    postsScanned: 0
  };

  if (!OFFLINE_MODE) {
    try {
      liveDiscovery = await discoverPolls(manifest);
      const xDiscovery = await discoverXPolls(manifest);
      liveDiscovery.xPolls = xDiscovery.polls;
      liveDiscovery.xFailures = xDiscovery.sourceFailures;
      liveDiscovery.postsScanned = xDiscovery.postsScanned;
    } catch (error) {
      liveDiscovery.articleErrors.push({
        link: "",
        title: "global-discovery-failure",
        message: error instanceof Error ? error.message : "Unknown discovery error"
      });
    }
  }

  const hasFreshLiveData = liveDiscovery.polls.length > 0 || liveDiscovery.xPolls.length > 0;
  const usingCachedData = !OFFLINE_MODE && !hasFreshLiveData && previousPolls.length > 0;
  const mergedPolls = dedupePolls(
    usingCachedData
      ? [...manualPolls, ...previousPolls]
      : [...liveDiscovery.polls, ...liveDiscovery.xPolls, ...manualPolls, ...previousPolls]
  );

  const hadErrors =
    OFFLINE_MODE ||
    liveDiscovery.feedErrors.length > 0 ||
    liveDiscovery.articleErrors.length > 0 ||
    liveDiscovery.xFailures.length > 0;

  const lastSuccessfulUpdate =
    !OFFLINE_MODE && hasFreshLiveData
      ? now
      : previousSnapshot?.metadata?.lastSuccessfulUpdate || now;

  const snapshot = {
    metadata: {
      tracker: "Tamil Nadu 2026 Assembly Poll Tracker",
      generatedAt: now,
      lastAttemptAt: now,
      lastSuccessfulUpdate,
      usingCachedData,
      hadErrors,
      fetchMode: OFFLINE_MODE ? "manual-only" : usingCachedData ? "cached" : "live+manual",
      warning:
        OFFLINE_MODE
          ? "This snapshot was built in offline mode, so only the verified seed records are included."
          : usingCachedData
            ? "Live fetching returned no fresh polls during the last run, so the tracker is showing the last cached snapshot plus verified seed records."
            : hadErrors
              ? "Some source checks failed during the last run. Cached entries remain available and validated rows stay visible."
              : null,
      totals: {
        polls: mergedPolls.length,
        sources: new Set(mergedPolls.map((poll) => poll.sourceDomain)).size,
        validatedLinks: mergedPolls.filter((poll) => poll.validation?.ok).length,
        manualSeeds: manualPolls.length,
        autoDiscovered: liveDiscovery.polls.length + liveDiscovery.xPolls.length,
        xDiscovered: liveDiscovery.xPolls.length
      },
      sourcesChecked: manifest.allowedDomains.length,
      articlesScanned: liveDiscovery.articlesScanned,
      postsScanned: liveDiscovery.postsScanned,
      activeQueries: manifest.queries,
      sourceFailures: [...liveDiscovery.feedErrors, ...liveDiscovery.articleErrors, ...liveDiscovery.xFailures]
    },
    polls: mergedPolls
  };

  ensureDirectory(OUTPUT_PATH);
  writeFileSync(OUTPUT_PATH, JSON.stringify(snapshot, null, 2));
  console.log(`Wrote ${snapshot.polls.length} poll rows to ${OUTPUT_PATH}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
