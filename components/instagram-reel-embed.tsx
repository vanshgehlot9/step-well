"use client";

import { ExternalLink, Instagram, Volume2 } from "lucide-react";

interface InstagramReelEmbedProps {
  embedUrl: string;
  externalUrl: string;
  title?: string;
  compact?: boolean;
  showSoundHint?: boolean;
}

export function InstagramReelEmbed({
  embedUrl,
  externalUrl,
  title = "Instagram Reel",
  compact = false,
  showSoundHint = true,
}: InstagramReelEmbedProps) {
  return (
    <div className="w-full flex flex-col items-center">
      <div
        className={`w-full ${
          compact ? "max-w-[300px]" : "max-w-[390px]"
        } rounded-xl overflow-hidden bg-white border border-surface-blue-dark/60`}
      >
        <iframe
          src={embedUrl}
          title={title}
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          allowFullScreen
          className={`w-full border-none bg-white ${
            compact ? "h-[460px]" : "h-[690px]"
          }`}
        />
      </div>

      {showSoundHint && (
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-center px-3">
          <span className="inline-flex items-center gap-1 text-[11px] text-[#4A6080]">
            <Volume2 size={12} className="text-accent-blue shrink-0" />
            Instagram embeds start muted in browsers. Tap the speaker icon or open directly:
          </span>
          <a
            href={externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-blue border border-surface-blue-dark text-[11px] font-bold text-[#0D3B66] hover:border-accent-blue transition-colors"
          >
            <Instagram size={12} className="text-pink-600" />
            Watch with Full Sound
            <ExternalLink size={11} />
          </a>
        </div>
      )}
    </div>
  );
}
