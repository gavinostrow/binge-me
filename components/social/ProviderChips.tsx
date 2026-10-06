"use client";
import type { Provider } from "@/lib/providers";
import { useSocial } from "@/lib/SocialContext";

/** Small logo-style chip for a streaming service. */
export function ProviderLogo({ provider, size = "sm" }: { provider: Provider; size?: "xs" | "sm" | "md" }) {
  const dims = size === "xs" ? "h-4 min-w-[16px] text-[8px] px-1" : size === "sm" ? "h-5 min-w-[20px] text-[9px] px-1.5" : "h-7 min-w-[28px] text-[11px] px-2";
  return (
    <span
      className={`${dims} inline-flex items-center justify-center rounded font-display font-extrabold leading-none tracking-tight flex-shrink-0`}
      style={{ backgroundColor: provider.color, color: provider.textColor ?? "#fff" }}
      title={provider.name}
    >
      {provider.short}
    </span>
  );
}

/** Row of logos, e.g. on a poster card. */
export function ProviderLogos({ providers, max = 2, size = "xs" }: { providers: Provider[]; max?: number; size?: "xs" | "sm" }) {
  if (providers.length === 0) return null;
  return (
    <span className="inline-flex items-center gap-1">
      {providers.slice(0, max).map((p) => (
        <ProviderLogo key={p.key} provider={p} size={size} />
      ))}
      {providers.length > max && <span className="text-[9px] text-text-muted font-body">+{providers.length - max}</span>}
    </span>
  );
}

/** "Where to watch" block for detail pages. */
export default function WhereToWatch({ providers, source }: { providers: Provider[]; source: "sample" | "tmdb" }) {
  const { myServices } = useSocial();
  const onMine = providers.filter((p) => myServices.includes(p.key));
  return (
    <div className="bg-bg-card rounded-2xl p-4 border border-border">
      <div className="flex items-center justify-between mb-3">
        <p className="text-text-muted text-xs font-body uppercase tracking-wider">Where to watch</p>
        {onMine.length > 0 && (
          <span className="text-[10px] font-body font-semibold text-rating-green bg-rating-green/10 border border-rating-green/30 rounded-full px-2 py-0.5">
            On your services
          </span>
        )}
      </div>
      {providers.length === 0 ? (
        <p className="text-text-secondary text-sm font-body">Not streaming on a subscription service right now.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {providers.map((p) => {
            const mine = myServices.includes(p.key);
            return (
              <span
                key={p.key}
                className={`flex items-center gap-2 rounded-xl pl-1.5 pr-3 py-1.5 border ${
                  mine ? "border-rating-green/40 bg-rating-green/5" : "border-border bg-bg-elevated"
                }`}
              >
                <ProviderLogo provider={p} size="md" />
                <span className="text-text-primary text-sm font-body font-semibold">{p.name}</span>
              </span>
            );
          })}
        </div>
      )}
      {source === "tmdb" && <p className="text-text-muted text-[10px] font-body mt-3">Streaming data powered by JustWatch</p>}
    </div>
  );
}
