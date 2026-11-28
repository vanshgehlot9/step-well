export type ResolvedVideoKind = "instagram" | "youtube" | "direct";

export interface ResolvedVideo {
  kind: ResolvedVideoKind;
  embedUrl: string;
  externalUrl: string;
}

/**
 * Extracts and normalizes an Instagram Reel, Post, or TV URL into an embeddable URL.
 * Supports /reel/, /reels/, /p/, /tv/, with or without trailing slashes/query params.
 */
export function parseInstagramReelEmbed(
  url: string
): { embedUrl: string; canonicalUrl: string } | null {
  try {
    const parsed = new URL(url.trim());
    const host = parsed.hostname.toLowerCase();
    if (!host.includes("instagram.com") && !host.includes("instagr.am")) {
      return null;
    }

    const match = parsed.pathname.match(/^\/(reel|reels|p|tv)\/([A-Za-z0-9_-]+)/i);
    if (!match) return null;

    const rawKind = match[1].toLowerCase();
    const kind = rawKind === "reels" ? "reel" : rawKind;
    const code = match[2];

    return {
      embedUrl: `https://www.instagram.com/${kind}/${code}/embed`,
      canonicalUrl: `https://www.instagram.com/${kind}/${code}/`,
    };
  } catch {
    return null;
  }
}

export function parseYoutubeEmbed(url: string, autoplay = false): string | null {
  try {
    const u = new URL(url.trim());
    const host = u.hostname.toLowerCase();
    const suffix = autoplay ? "?autoplay=1" : "";

    if (host.includes("youtube.com")) {
      if (u.pathname.startsWith("/embed/")) {
        const id = u.pathname.replace("/embed/", "").split("/")[0];
        return id ? `https://www.youtube.com/embed/${id}${suffix}` : null;
      }
      if (u.pathname.startsWith("/shorts/")) {
        const id = u.pathname.replace("/shorts/", "").split("/")[0];
        return id ? `https://www.youtube.com/embed/${id}${suffix}` : null;
      }
      const id = u.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}${suffix}` : null;
    }

    if (host.includes("youtu.be")) {
      const id = u.pathname.replace(/^\//, "").split("/")[0];
      return id ? `https://www.youtube.com/embed/${id}${suffix}` : null;
    }

    return null;
  } catch {
    return null;
  }
}

export function resolveInitiativeVideo(url: string, autoplay = false): ResolvedVideo {
  const insta = parseInstagramReelEmbed(url);
  if (insta) {
    return {
      kind: "instagram",
      embedUrl: insta.embedUrl,
      externalUrl: insta.canonicalUrl,
    };
  }

  const yt = parseYoutubeEmbed(url, autoplay);
  if (yt) {
    return {
      kind: "youtube",
      embedUrl: yt,
      externalUrl: url.trim(),
    };
  }

  return {
    kind: "direct",
    embedUrl: url.trim(),
    externalUrl: url.trim(),
  };
}
