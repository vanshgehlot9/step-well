"use client";

import { ExternalLink, Instagram } from "lucide-react";

interface InstagramReelEmbedProps {
  embedUrl: string;
  externalUrl: string;
  title?: string;
  compact?: boolean;
  showExternalLink?: boolean;
}

export function InstagramReelEmbed({
  embedUrl,
  externalUrl,
  title = "Instagram Reel",
  compact = false,
  showExternalLink = true,
}: InstagramReelEmbedProps) {
  return (
    <div className="w-full flex flex-col items-center">
      <div
        className="w-full rounded-xl overflow-hidden bg-white border border-surface-blue-dark/60"
        style={{ maxWidth: compact ? "360px" : "390px" }}
      >
        <iframe
          src={embedUrl}
          title={title}
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          allowFullScreen
          className="w-full border-none bg-white"
          style={{ height: compact ? "500px" : "660px" }}
        />
      </div>

      {showExternalLink && (
        <a
          href={externalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-surface-blue border border-surface-blue-dark text-xs font-semibold text-[#0D3B66] hover:border-accent-blue transition-colors"
        >
          <Instagram size={13} className="text-pink-600" />
          Open Reel on Instagram
          <ExternalLink size={11} />
        </a>
      )}
    </div>
  );
}
