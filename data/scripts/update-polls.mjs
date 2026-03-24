
const X_MIRROR_PREFIX = "https://r.jina.ai/http://x.com/";

const PARTY_ALIASES = {
  dmk: ["DMK", "DMK alliance", "DMK-led alliance", "DMK+"],
  dmk: ["DMK", "DMK alliance", "DMK-led alliance", "Dravida Munnetra Kazhagam-led alliance", "DMK+"],
  bjpAlliance: [
    "BJP alliance",
    "BJP-led alliance",
    "AIADMK-BJP alliance",
    "AIADMK-led alliance",
    "AIADMK alliance",
    "All India Anna Dravida Munnetra Kazhagam-led front",
    "AIADMK+"
  ],
  tvk: ["TVK", "Vijay's TVK", "Tamizhaga Vettri Kazhagam", "Tamilaga Vettri Kazhagam"],
  tvk: ["TVK", "Vijay's TVK", "Tamilaga Vettri Kazhagam", "Tamizhaga Vettri Kazhagam"],
  aiadmk: ["AIADMK", "AIADMK-led", "AIADMK party"]
};

const CM_CANDIDATE_ALIASES = {
  "M. K. Stalin": ["MK Stalin", "M K Stalin", "Chief Minister MK Stalin", "Stalin"],
  "Edappadi K. Palaniswami": [
    "Edappadi K Palaniswami",
    "Edappadi Karuppa Palaniswami",
    "Palaniswami",
    "EPS"
  ],
  Vijay: ["Vijay", "TVK chief Vijay"],
  Annamalai: ["Annamalai", "K Annamalai"]
};

const ZONE_ALIASES = {
  North: ["North Tamil Nadu", "North zone", "North TN", "Northern region"],
  South: ["South Tamil Nadu", "South zone", "South TN", "Southern region"],
  West: ["West Tamil Nadu", "West zone", "West TN", "Western region"],
  Central: ["Central Tamil Nadu", "Central zone", "Central region"],
  Delta: ["Delta region", "Cauvery delta", "Delta zone"],
  Chennai: ["Chennai", "Chennai region", "Chennai zone"]
};

const LOCAL_SOURCE_PATTERNS = [
  /thanthitv/i,
  /news7tamil/i,
    const response = await fetch(url, {
      redirect: "follow",
      headers: {
        "user-agent": "tn-2026-poll-tracker/1.1",
        "user-agent": "tn-2026-poll-tracker/1.2",
        accept: "text/html,application/xhtml+xml,application/xml,text/xml;q=0.9,*/*;q=0.8"
      },
      signal: controller.signal
      method: "HEAD",
      redirect: "follow",
      headers: {
        "user-agent": "tn-2026-poll-tracker/1.1"
        "user-agent": "tn-2026-poll-tracker/1.2"
      }
    });

  };
}

function normalizeMetricMap(map = {}) {
  const normalized = {};
  for (const [key, value] of Object.entries(map || {})) {
    normalized[key] = normalizeMetric(value, typeof value === "number" ? "%" : "");
  }
  return normalized;
}

function normalizePoll(poll) {
  const sourceUrl = poll.sourceUrl || poll.link || "";
  const sourceDomain = poll.sourceDomain || getDomain(sourceUrl);
      tvk: normalizeMetric(poll.voteShare?.tvk, "%"),
      aiadmk: normalizeMetric(poll.voteShare?.aiadmk, "%")
    },
    cmPreference: normalizeMetricMap(poll.cmPreference),
    zoneWise: poll.zoneWise || {},
    confidence: poll.confidence || "auto"
  };

  };
}

function createMetricFromPair(start, end) {
  const numericStart = Number(start);
  const numericEnd = end === null || end === undefined || end === "" ? null : Number(end);

  if (!Number.isFinite(numericStart)) {
    return null;
  }

  if (numericEnd === null || !Number.isFinite(numericEnd)) {
    return {
      value: numericStart,
      display: String(numericStart)
    };
  }

  return {
    value: Number(((numericStart + numericEnd) / 2).toFixed(2)),
    display: `${numericStart}-${numericEnd}`
  };
}

function isHistoricalSnippet(text, index) {
  const start = Math.max(0, index - 100);
  const end = Math.min(text.length, index + 100);
}

function extractPercent(text, aliases) {
  for (const alias of aliases) {
    const pattern = new RegExp(
      `${aliasPattern(alias)}[^.%\\d]{0,60}(\\d{1,3}(?:\\.\\d+)?)(?:\\s*[-–]\\s*(\\d{1,3}(?:\\.\\d+)?))?\\s*(?:%|per\\s+cent|percent)`,
      "gi"
    );
  const sentences = splitIntoSentences(text);

    for (const match of text.matchAll(pattern)) {
      if (isHistoricalSnippet(text, match.index || 0)) {
  for (const sentence of sentences) {
    if (!/(vote|vote share|support|backing|backed|preference|prefer|receiv|garner|secure)/i.test(sentence)) {
      continue;
    }

    for (const alias of aliases) {
      if (!new RegExp(aliasPattern(alias), "i").test(sentence)) {
        continue;
      }
      const metric = createMetric(match);
      if (metric) {
        return {
          value: metric.value,
          display: `${metric.display}%`
        };

      const patterns = [
        new RegExp(
          `${aliasPattern(alias)}[^.%\\d]{0,60}(\\d{1,3}(?:\\.\\d+)?)(?:\\s*(?:-|to|and|–)\\s*(\\d{1,3}(?:\\.\\d+)?))?\\s*(?:%|per\\s+cent|percent)`,
          "i"
        ),
        new RegExp(
          `(\\d{1,3}(?:\\.\\d+)?)(?:\\s*(?:-|to|and|–)\\s*(\\d{1,3}(?:\\.\\d+)?))?\\s*(?:%|per\\s+cent|percent)[^.]{0,60}${aliasPattern(alias)}`,
          "i"
        )
      ];

      for (const pattern of patterns) {
        const match = sentence.match(pattern);
        if (!match) {
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
  }
}

function extractSeats(text, aliases) {
  for (const alias of aliases) {
    const pattern = new RegExp(
      `${aliasPattern(alias)}[^\\d]{0,60}(\\d{1,3})(?:\\s*[-–]\\s*(\\d{1,3}))?\\s+seats?`,
      "gi"
  const sentences = splitIntoSentences(text);

  for (const sentence of sentences) {
    for (const alias of aliases) {
      if (!new RegExp(aliasPattern(alias), "i").test(sentence)) {
        continue;
      }

      const patterns = [
        new RegExp(
          `${aliasPattern(alias)}[^\\d]{0,120}(?:between\\s+)?(\\d{1,3})(?:\\s*(?:-|to|and|–)\\s*(\\d{1,3}))?\\s+seats?`,
          "i"
        ),
        new RegExp(
          `(\\d{1,3})(?:\\s*(?:-|to|and|–)\\s*(\\d{1,3}))?\\s+seats?[^.]{0,120}${aliasPattern(alias)}`,
          "i"
        )
      ];

      for (const pattern of patterns) {
        const match = sentence.match(pattern);
        if (match) {
          return createMetric(match);
        }
      }
    }
  }

  return null;
}

function extractCmPreference(text) {
  const result = {};
  const sentences = splitIntoSentences(text);

  for (const [candidate, aliases] of Object.entries(CM_CANDIDATE_ALIASES)) {
    for (const alias of aliases) {
      for (const sentence of sentences) {
        if (!new RegExp(aliasPattern(alias), "i").test(sentence)) {
          continue;
        }

        const beforePattern = new RegExp(
          `${aliasPattern(alias)}[^.%\\d]{0,50}(\\d{1,3}(?:\\.\\d+)?)\\s*(?:%|per\\s+cent|percent)`,
          "i"
        );
        const afterPattern = new RegExp(
          `(\\d{1,3}(?:\\.\\d+)?)\\s*(?:%|per\\s+cent|percent)[^.]{0,50}${aliasPattern(alias)}`,
          "i"
        );

        const beforeMatch = sentence.match(beforePattern);
        if (beforeMatch) {
          result[candidate] = { value: Number(beforeMatch[1]), display: `${beforeMatch[1]}%` };
          break;
        }

        const afterMatch = sentence.match(afterPattern);
        if (afterMatch) {
          result[candidate] = { value: Number(afterMatch[1]), display: `${afterMatch[1]}%` };
          break;
        }
      }

      if (result[candidate]) {
        break;
      }
    }
  }

  return result;
}

function extractZoneWise(text) {
  const zoneWise = {};
  const sentences = splitIntoSentences(text);

  for (const [zone, aliases] of Object.entries(ZONE_ALIASES)) {
    const sentence = sentences.find((currentSentence) =>
      aliases.some((alias) => currentSentence.toLowerCase().includes(alias.toLowerCase())) &&
      (
        /\b\d{1,3}(?:\.\d+)?\s*(?:%|per\s+cent|percent|seats?)\b/i.test(currentSentence) ||
        /dmk|aiadmk|nda|bjp|tvk|stalin|palaniswami|vijay/i.test(currentSentence)
      )
    );
    if (sentence) {
      zoneWise[zone] = sentence.trim();
    }
  }

  return zoneWise;
}

function extractSeatMetricStrict(text, aliases) {
  const sentences = splitIntoSentences(text).map((sentence) => sentence.replace(/â€“/g, "-"));

  for (const sentence of sentences) {
    for (const alias of aliases) {
      if (!new RegExp(aliasPattern(alias), "i").test(sentence)) {
        continue;
      }

      const patterns = [
        new RegExp(
          `${aliasPattern(alias)}[^\\d]{0,180}(?:win(?:s)?|secure(?:s|d)?|receive(?:s|d)?|get(?:s)?|bag(?:s)?|project(?:ed|s)?(?:\\s+to)?|forecast(?:ed|s)?(?:\\s+to)?|place(?:s|d)?(?:\\s+it|\\s+them)?\\s+between|between|seat range of|an identical seat range of)?[^\\d]{0,40}(\\d{1,3})(?:\\s*(?:-|to|and)\\s*(\\d{1,3}))?(?:\\s+seats?)?`,
          "i"
        ),
        new RegExp(
          `(\\d{1,3})(?:\\s*(?:-|to|and)\\s*(\\d{1,3}))?(?:\\s+seats?)?[^.]{0,160}${aliasPattern(alias)}`,
          "i"
        )
      ];

      for (const pattern of patterns) {
        const match = sentence.match(pattern);
        const metric = createMetric(match);
        if (metric) {
          return metric;
        }
      }
    }
  }

  return extractSeats(text, aliases);
}

function extractVoteShareMetricStrict(text, aliases) {
  const sentences = splitIntoSentences(text).map((sentence) => sentence.replace(/â€“/g, "-"));

  for (const sentence of sentences) {
    if (!/(vote|vote share|support|backing|backed|receiv|garner|secure)/i.test(sentence)) {
      continue;
    }

    for (const alias of aliases) {
      if (!new RegExp(aliasPattern(alias), "i").test(sentence)) {
        continue;
      }

      const patterns = [
        new RegExp(
          `${aliasPattern(alias)}[^.%\\d]{0,60}(\\d{1,3}(?:\\.\\d+)?)(?:\\s*(?:-|to|and)\\s*(\\d{1,3}(?:\\.\\d+)?))?\\s*(?:%|per\\s+cent|percent)`,
          "i"
        ),
        new RegExp(
          `(\\d{1,3}(?:\\.\\d+)?)(?:\\s*(?:-|to|and)\\s*(\\d{1,3}(?:\\.\\d+)?))?\\s*(?:%|per\\s+cent|percent)[^.]{0,60}${aliasPattern(alias)}`,
          "i"
        )
      ];

      for (const pattern of patterns) {
        const match = sentence.match(pattern);
        const metric = createMetric(match);
        if (metric) {
          return {
            value: metric.value,
            display: `${metric.display}%`
          };
        }
      }
    }
  }

  return null;
}

    for (const match of text.matchAll(pattern)) {
      if (isHistoricalSnippet(text, match.index || 0)) {
function extractSeatMetricSafest(text, aliases) {
  const sentences = splitIntoSentences(text).map((sentence) => sentence.replace(/[–—]/g, "-"));

  for (const sentence of sentences) {
    if (looksHistoricalOnly(sentence) || !/\bseat/i.test(sentence)) {
      continue;
    }

    for (const alias of aliases) {
      if (!new RegExp(aliasPattern(alias), "i").test(sentence)) {
        continue;
      }
      return createMetric(match);

      const patterns = [
        new RegExp(
          `${aliasPattern(alias)}[^\\d]{0,180}(?:win(?:s)?|secure(?:s|d)?|receive(?:s|d)?|get(?:s)?|bag(?:s)?|project(?:ed|s)?(?:\\s+to)?|forecast(?:ed|s)?(?:\\s+to)?|place(?:s|d)?(?:\\s+it|\\s+them)?\\s+between|between|seat range of|an identical seat range of)?[^\\d]{0,40}(\\d{1,3})(?:\\s*(?:-|to|and)\\s*(\\d{1,3}))?\\s+seats?`,
          "i"
        ),
        new RegExp(
          `${aliasPattern(alias)}[^\\d]{0,180}seat range of\\s+(\\d{1,3})(?:\\s*(?:-|to|and)\\s*(\\d{1,3}))?`,
          "i"
        )
      ];

      for (const pattern of patterns) {
        const metric = createMetric(sentence.match(pattern));
        if (metric) {
          return metric;
        }
      }
    }
  }

  return null;
}

function extractVoteShareMetricSafest(text, aliases) {
  const sentences = splitIntoSentences(text).map((sentence) => sentence.replace(/[–—]/g, "-"));

  for (const sentence of sentences) {
    if (
      looksHistoricalOnly(sentence) ||
      !/(vote|vote share|votes|share of votes|per cent of the vote|garner|receive|alliance)/i.test(sentence)
    ) {
      continue;
    }

    for (const alias of aliases) {
      if (!new RegExp(aliasPattern(alias), "i").test(sentence)) {
        continue;
      }

      const patterns = [
        new RegExp(
          `${aliasPattern(alias)}[^.%\\d]{0,60}(\\d{1,3}(?:\\.\\d+)?)(?:\\s*(?:-|to|and)\\s*(\\d{1,3}(?:\\.\\d+)?))?\\s*(?:%|per\\s+cent|percent)`,
          "i"
        ),
        new RegExp(
          `(\\d{1,3}(?:\\.\\d+)?)(?:\\s*(?:-|to|and)\\s*(\\d{1,3}(?:\\.\\d+)?))?\\s*(?:%|per\\s+cent|percent)[^.]{0,60}${aliasPattern(alias)}`,
          "i"
        )
      ];

      for (const pattern of patterns) {
        const metric = createMetric(sentence.match(pattern));
        if (metric) {
          return {
            value: metric.value,
            display: `${metric.display}%`
          };
        }
      }
    }
  }

  return null;
}

function extractNews18VoteVibeOverrides(text) {
  const overrides = {
    seatProjection: {},
    voteShare: {},
    cmPreference: {},
    zoneWise: {}
  };

  const dmkSeats = text.match(/Dravida Munnetra Kazhagam-led alliance[\s\S]{0,160}?between\s+(\d{1,3})\s+and\s+(\d{1,3})\s+seats/i);
  const ndaSeats = text.match(/All India Anna Dravida Munnetra Kazhagam-led front[\s\S]{0,160}?seat range of\s+(\d{1,3})\s+to\s+(\d{1,3})/i);
  const tvkSeats = text.match(/Tamilaga Vettri Kazhagam[\s\S]{0,120}?between\s+(\d{1,3})\s+and\s+(\d{1,3})\s+seats/i);
  const stalin = text.match(/MK Stalin leads marginally with\s+(\d{1,3}(?:\.\d+)?)%/i);
  const eps = text.match(/Edappadi K Palaniswami at\s+(\d{1,3}(?:\.\d+)?)%/i);

  overrides.seatProjection.dmk = dmkSeats ? createMetricFromPair(dmkSeats[1], dmkSeats[2]) : null;
  overrides.seatProjection.bjpAlliance = ndaSeats ? createMetricFromPair(ndaSeats[1], ndaSeats[2]) : null;
  overrides.seatProjection.tvk = tvkSeats ? createMetricFromPair(tvkSeats[1], tvkSeats[2]) : null;
  overrides.seatProjection.aiadmk = null;
  overrides.voteShare.dmk = null;
  overrides.voteShare.bjpAlliance = null;
  overrides.voteShare.tvk = null;
  overrides.voteShare.aiadmk = null;
  overrides.cmPreference["M. K. Stalin"] = stalin
    ? { value: Number(stalin[1]), display: `${stalin[1]}%` }
    : null;
  overrides.cmPreference["Edappadi K. Palaniswami"] = eps
    ? { value: Number(eps[1]), display: `${eps[1]}%` }
    : null;

  return overrides;
}

function extractMetaContent(html, key) {
  const patterns = [
    new RegExp(`<meta[^>]+name=["']${escapeRegex(key)}["'][^>]+content=["']([^"']+)["']`, "i"),
  return candidates[0] || "";
}

function extractArticleBodyText(html) {
  const directMatch = html.match(/"articleBody":"((?:\\.|[^"\\])+)"/i);
  if (directMatch) {
    try {
      const text = JSON.parse(`"${directMatch[1]}"`);
      const cleaned = stripTags(text);
      if (cleaned.length > 200) {
        return cleaned;
      }
    } catch {
      // Fall through to JSON-LD parsing.
    }
  }

  const matches = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];

  for (const match of matches) {
    const raw = decodeHtml(match[1] || "").trim();
    if (!raw) {
      continue;
    }

    try {
      const parsed = JSON.parse(raw);
      const entries = Array.isArray(parsed) ? parsed : [parsed];

      for (const entry of entries) {
        if (!entry || typeof entry !== "object") {
          continue;
        }

        const articleBody = typeof entry.articleBody === "string" ? stripTags(entry.articleBody) : "";
        if (articleBody && articleBody.length > 200) {
          return articleBody;
        }
      }
    } catch {
      // Ignore malformed JSON-LD blocks and continue.
    }
  }

  return "";
}

function splitIntoSentences(text = "") {
  return String(text)
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function isPollLike(text) {
  return /(tamil nadu|tamilnadu)/i.test(text) && /(survey|opinion poll|pre poll|tracker|state vibe|vote vibe|parawheel|c-voter|axis my india|matrize|ians|loyola|ipds|channel survey|tv survey|karuthu)/i.test(text);
  return /(tamil nadu|tamilnadu)/i.test(text) && /(survey|opinion poll|pre-poll|pre poll|tracker|state vibe|vote vibe|parawheel|c-voter|axis my india|matrize|ians|loyola|ipds|channel survey|tv survey|karuthu)/i.test(text);
}

function countSignals(poll) {
  let count = 0;
  for (const metricGroup of [poll.seatProjection, poll.voteShare]) {
    for (const metric of Object.values(metricGroup)) {
  for (const metricGroup of [poll.seatProjection, poll.voteShare, poll.cmPreference]) {
    for (const metric of Object.values(metricGroup || {})) {
      if (metric && typeof metric.value === "number" && Number.isFinite(metric.value)) {
        count += 1;
      }
    const normalizedAnchor = stripTags(anchor).slice(0, 120);
    const startIndex = normalizedAnchor ? visibleText.indexOf(normalizedAnchor) : -1;
    if (startIndex >= 0) {
      return visibleText.slice(startIndex, startIndex + 5000);
      return visibleText.slice(startIndex, startIndex + 7000);
    }
  }

  return visibleText.slice(0, 5000);
  return visibleText.slice(0, 7000);
}

function removeHistoricalContext(text = "") {
  return text
    .split(/(?<=[.!?])\s+/)
    .filter((sentence) => !( /(2016|2019|2021|2024)/.test(sentence) && /(election|elections|assembly|lok sabha|won|secured|victory)/i.test(sentence) && !/2026/.test(sentence) ))
    .filter((sentence) => !(
      /(2016|2019|2021|2024)/.test(sentence) &&
      /(election|elections|assembly|lok sabha|won|secured|victory)/i.test(sentence) &&
      !/2026/.test(sentence)
    ))
    .join(" ");
}

    return null;
  }

  const visibleText = stripTags(resolved.body);
  const articleBodyText = extractArticleBodyText(resolved.body);
  const visibleText = articleBodyText || stripTags(resolved.body);
  const rawMetaDescription = extractDescriptionMeta(resolved.body);
  const metaDescription = looksHistoricalOnly(rawMetaDescription) ? "" : removeHistoricalContext(rawMetaDescription);
  const focusedText = removeHistoricalContext(buildFocusedArticleText(item, metaDescription, visibleText));
  const combinedText = removeHistoricalContext(
    [item.title, item.description, metaDescription, focusedText].filter(Boolean).join(" ")
    (articleBodyText ? [item.title, articleBodyText] : [item.title, item.description, metaDescription, focusedText])
      .filter(Boolean)
      .join(" ")
  );

  if (!isPollLike(combinedText)) {
  }

  const seatProjection = {
    dmk: extractSeats(combinedText, PARTY_ALIASES.dmk),
    bjpAlliance: extractSeats(combinedText, PARTY_ALIASES.bjpAlliance),
    tvk: extractSeats(combinedText, PARTY_ALIASES.tvk),
    aiadmk: extractSeats(combinedText, PARTY_ALIASES.aiadmk)
    dmk: extractSeatMetricSafest(combinedText, PARTY_ALIASES.dmk),
    bjpAlliance: extractSeatMetricSafest(combinedText, PARTY_ALIASES.bjpAlliance),
    tvk: extractSeatMetricSafest(combinedText, PARTY_ALIASES.tvk),
    aiadmk: extractSeatMetricSafest(combinedText, PARTY_ALIASES.aiadmk)
  };
  const voteShare = {
    dmk: extractPercent(combinedText, PARTY_ALIASES.dmk),
    bjpAlliance: extractPercent(combinedText, PARTY_ALIASES.bjpAlliance),
    tvk: extractPercent(combinedText, PARTY_ALIASES.tvk),
    aiadmk: extractPercent(combinedText, PARTY_ALIASES.aiadmk)
    dmk: extractVoteShareMetricSafest(combinedText, PARTY_ALIASES.dmk),
    bjpAlliance: extractVoteShareMetricSafest(combinedText, PARTY_ALIASES.bjpAlliance),
    tvk: extractVoteShareMetricSafest(combinedText, PARTY_ALIASES.tvk),
    aiadmk: extractVoteShareMetricSafest(combinedText, PARTY_ALIASES.aiadmk)
  };
  const cmPreference = extractCmPreference(combinedText);
  const zoneWise = extractZoneWise(combinedText);

  if (looksHistoricalOnly(rawMetaDescription)) {
    seatProjection.dmk = null;
    seatProjection.bjpAlliance = null;
    seatProjection.tvk = null;
    seatProjection.aiadmk = null;
  if (sourceDomain === "news18.com" && /vote tracker opinion poll by votevibe|released exclusively on cnn-news18/i.test(combinedText)) {
    const overrides = extractNews18VoteVibeOverrides(articleBodyText || combinedText);
    seatProjection.dmk = overrides.seatProjection.dmk;
    seatProjection.bjpAlliance = overrides.seatProjection.bjpAlliance;
    seatProjection.tvk = overrides.seatProjection.tvk;
    seatProjection.aiadmk = overrides.seatProjection.aiadmk;
    voteShare.dmk = overrides.voteShare.dmk;
    voteShare.bjpAlliance = overrides.voteShare.bjpAlliance;
    voteShare.tvk = overrides.voteShare.tvk;
    voteShare.aiadmk = overrides.voteShare.aiadmk;
    cmPreference["M. K. Stalin"] = overrides.cmPreference["M. K. Stalin"] || cmPreference["M. K. Stalin"];
    cmPreference["Edappadi K. Palaniswami"] =
      overrides.cmPreference["Edappadi K. Palaniswami"] || cmPreference["Edappadi K. Palaniswami"];
  }

  const poll = normalizePoll({
    sourceUrl: hintedSourceUrl || sourceUrl,
    sourceDomain,
    headline: item.title,
    summary: metaDescription || item.description || item.title,
    summary:
      splitIntoSentences(articleBodyText || focusedText)[0] ||
      metaDescription ||
      item.description ||
      item.title,
    seatProjection,
    voteShare,
    cmPreference,
    zoneWise,
    notes: "Auto-discovered from scheduled feed ingestion. Review alliance labels before republishing if a story only reports combined blocs.",
    validation,
    discovery: {
    headline: item.title,
    summary: item.description.slice(0, 280),
    seatProjection: {
      dmk: extractSeats(combinedText, PARTY_ALIASES.dmk),
      bjpAlliance: extractSeats(combinedText, PARTY_ALIASES.bjpAlliance),
      tvk: extractSeats(combinedText, PARTY_ALIASES.tvk),
      aiadmk: extractSeats(combinedText, PARTY_ALIASES.aiadmk)
      dmk: extractSeatMetricSafest(combinedText, PARTY_ALIASES.dmk),
      bjpAlliance: extractSeatMetricSafest(combinedText, PARTY_ALIASES.bjpAlliance),
      tvk: extractSeatMetricSafest(combinedText, PARTY_ALIASES.tvk),
      aiadmk: extractSeatMetricSafest(combinedText, PARTY_ALIASES.aiadmk)
    },
    voteShare: {
      dmk: extractPercent(combinedText, PARTY_ALIASES.dmk),
      bjpAlliance: extractPercent(combinedText, PARTY_ALIASES.bjpAlliance),
      tvk: extractPercent(combinedText, PARTY_ALIASES.tvk),
      aiadmk: extractPercent(combinedText, PARTY_ALIASES.aiadmk)
      dmk: extractVoteShareMetricSafest(combinedText, PARTY_ALIASES.dmk),
      bjpAlliance: extractVoteShareMetricSafest(combinedText, PARTY_ALIASES.bjpAlliance),
      tvk: extractVoteShareMetricSafest(combinedText, PARTY_ALIASES.tvk),
      aiadmk: extractVoteShareMetricSafest(combinedText, PARTY_ALIASES.aiadmk)
    },
    cmPreference: extractCmPreference(combinedText),
    zoneWise: extractZoneWise(combinedText),
    notes: `Auto-discovered from the official X handle @${item.sourceHandle}.`,
    validation: {
      ok: true,

  for (const poll of polls) {
    const key = [poll.pollster, poll.pollDate, poll.sourceUrl || poll.sourceDomain].join("|");

    if (!seen.has(key)) {
      seen.set(key, poll);
    }
        validatedLinks: mergedPolls.filter((poll) => poll.validation?.ok).length,
        manualSeeds: manualPolls.length,
        autoDiscovered: liveDiscovery.polls.length + liveDiscovery.xPolls.length,
        xDiscovered: liveDiscovery.xPolls.length
        xDiscovered: liveDiscovery.xPolls.length,
        cmPreferenceRows: mergedPolls.filter((poll) => Object.keys(poll.cmPreference || {}).length).length,
        zoneRows: mergedPolls.filter((poll) => Object.keys(poll.zoneWise || {}).length).length
      },
      sourcesChecked: manifest.allowedDomains.length,
      articlesScanned: liveDiscovery.articlesScanned,
