"use client";
import { useMemo, useState } from "react";
import { useApp } from "@/lib/AppContext";
import { useSocial } from "@/lib/SocialContext";
import { computeWrapped, periodsFor } from "@/lib/wrapped";
import PosterImage from "@/components/PosterImage";
import RatingBadge from "@/components/RatingBadge";
import ScreenHeader from "@/components/social/ScreenHeader";
import UserAvatar from "@/components/social/UserAvatar";

/** Binge Wrapped — yearly and quarterly recaps. */
export default function WrappedScreen({ period: initial }: { period?: string }) {
  const { showRatings, pushScreen, currentUserData } = useApp();
  const { myRows, followingIds, getUser, showToast } = useSocial();
  const now = new Date();
  const [year, setYear] = useState(initial ? Number(initial.slice(0, 4)) : now.getFullYear());
  const periods = periodsFor(year, now);
  const [key, setKey] = useState(initial && periods.some((p) => p.key === initial) ? initial : periods[0].key);
  const period = periods.find((p) => p.key === key) ?? periods[0];

  const data = useMemo(
    () => computeWrapped(period, showRatings, myRows, followingIds),
    [period, showRatings, myRows, followingIds],
  );

  const share = async () => {
    if (!data) return;
    const lines = [
      `My Binge Wrapped · ${period.label}`,
      `${data.shows} shows · ${data.seasons} seasons · ~${data.hours} hours`,
      ...data.topShows.map((t, i) => `#${i + 1} ${t.item.title} (${t.rating.toFixed(1)})`),
      data.topGenre ? `Top genre: ${data.topGenre.name}` : "",
      `I'm ${data.persona.title}`,
    ].filter(Boolean);
    const text = lines.join("\n");
    try {
      if (navigator.share) await navigator.share({ title: "My Binge Wrapped", text });
      else {
        await navigator.clipboard.writeText(text);
        showToast("Wrapped copied — paste it anywhere");
      }
    } catch {
      /* dismissed */
    }
  };

  const twin = data?.tasteTwin ? getUser(data.tasteTwin.userId) : undefined;
  const maxMonth = Math.max(1, ...(data?.months.map((m) => m.count) ?? [1]));

  return (
    <div className="flex flex-col h-full overflow-y-auto scrollbar-hide bg-bg-primary">
      <ScreenHeader
        title="Binge Wrapped"
        subtitle={period.inProgress ? `${period.label} · so far` : period.label}
        right={
          data ? (
            <button onClick={share} className="px-3 py-1.5 rounded-lg bg-accent text-white text-xs font-display font-bold">
              Share
            </button>
          ) : undefined
        }
      />

      <div className="px-4 pt-3 pb-28 space-y-3">
        {/* Period picker */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4">
          <button
            onClick={() => {
              setYear(year - 1);
              setKey(`${year - 1}`);
            }}
            className="flex-shrink-0 w-8 h-8 rounded-full border border-border text-text-secondary"
            aria-label="Previous year"
          >
            ‹
          </button>
          {periods.map((p) => (
            <button
              key={p.key}
              onClick={() => setKey(p.key)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-md text-xs font-display font-bold border transition-colors ${
                p.key === key ? "bg-accent border-accent text-white" : "border-border text-text-secondary"
              }`}
            >
              {p.short === "Year" ? year : p.short}
              {p.inProgress && p.short !== "Year" ? " · now" : ""}
            </button>
          ))}
          {year < now.getFullYear() && (
            <button
              onClick={() => {
                setYear(year + 1);
                setKey(`${year + 1}`);
              }}
              className="flex-shrink-0 w-8 h-8 rounded-full border border-border text-text-secondary"
              aria-label="Next year"
            >
              ›
            </button>
          )}
        </div>

        {!data ? (
          <div className="text-center py-16">
            <p className="text-text-primary font-display font-bold text-lg">Nothing logged in {period.label}</p>
            <p className="text-text-secondary text-sm mt-1">Rate what you watch and your recap builds itself.</p>
          </div>
        ) : (
          <>
            {/* Hero */}
            <Card tone="accent">
              <p className="text-text-muted text-[10px] font-body uppercase tracking-widest">{period.label}</p>
              <p className="text-text-primary font-mono font-semibold text-5xl leading-none mt-3">{data.shows}</p>
              <p className="text-text-secondary font-body text-sm mt-1">shows rated</p>
              <div className="grid grid-cols-3 gap-4 mt-5 pt-4 border-t border-border">
                <Stat n={data.seasons} label="seasons" />
                <Stat n={data.episodes} label="episodes (est.)" />
                <Stat n={data.hours} label="hours (est.)" />
              </div>
              <p className="text-text-secondary text-sm font-body mt-4">
                {data.hours >= 24
                  ? `That's about ${(data.hours / 24).toFixed(1)} full days of TV.`
                  : `About ${data.hours} hours of TV.`}
              </p>
            </Card>

            {/* Persona */}
            <Card tone="gold">
              <p className="text-text-muted text-[10px] font-body uppercase tracking-widest">Your watcher type</p>
              <p className="text-text-primary font-display font-semibold text-2xl leading-tight mt-2">{data.persona.title}</p>
              <p className="text-text-secondary text-sm font-body mt-1">{data.persona.line}</p>
              <p className="text-text-secondary text-sm font-body mt-4">
                Average rating <span className="font-mono font-semibold text-text-primary text-base">{data.avg.toFixed(1)}</span>
              </p>
            </Card>

            {/* Top shows */}
            {data.topShows.length > 0 && (
              <SmallCard label={data.topShows.length > 1 ? `Your top ${data.topShows.length}` : "Your #1 show"}>
                <div className="divide-y divide-border">
                  {data.topShows.map((t, i) => (
                    <button
                      key={t.item.id}
                      onClick={() => pushScreen({ screen: "show-detail", showId: t.item.id })}
                      className="w-full flex items-center gap-3 py-2.5 text-left"
                    >
                      <span className="w-5 text-center font-mono font-semibold text-text-muted text-sm">{i + 1}</span>
                      <PosterImage title={t.item.title} year={t.item.year} posterPath={t.item.posterPath} size="sm" />
                      <p className="flex-1 min-w-0 text-text-primary text-sm font-display font-semibold truncate">{t.item.title}</p>
                      <RatingBadge rating={t.rating} size="sm" />
                    </button>
                  ))}
                </div>
              </SmallCard>
            )}

            {/* Genre + platform */}
            <div className="grid grid-cols-2 gap-3">
              {data.topGenre && (
                <SmallCard label="Top genre">
                  <p className="text-text-primary font-display font-semibold text-xl leading-tight">{data.topGenre.name}</p>
                  <p className="text-text-secondary text-xs font-body mt-1">{data.topGenre.share}% of what you watched</p>
                </SmallCard>
              )}
              {data.topPlatform && (
                <SmallCard label="Most-watched on">
                  <p className="text-text-primary font-display font-semibold text-xl leading-tight">{data.topPlatform.name}</p>
                  <p className="text-text-secondary text-xs font-body mt-1">
                    {data.topPlatform.count} show{data.topPlatform.count === 1 ? "" : "s"}
                  </p>
                </SmallCard>
              )}
            </div>

            {/* Month by month */}
            {data.months.length > 1 && (
              <SmallCard label="Month by month">
                <div className="flex items-end gap-2 h-24 mt-2">
                  {data.months.map((m) => (
                    <div key={m.label} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[10px] text-text-secondary font-body">{m.count || ""}</span>
                      <div
                        className="w-full rounded-t-md bg-accent"
                        style={{ height: `${Math.max(4, (m.count / maxMonth) * 64)}px`, opacity: m.count ? 1 : 0.25 }}
                      />
                      <span className="text-[10px] text-text-muted font-body">{m.label}</span>
                    </div>
                  ))}
                </div>
              </SmallCard>
            )}

            {/* Hot take */}
            {data.hotTake && (
              <SmallCard label="Your hottest take">
                <div className="flex items-center gap-3 mt-1">
                  <PosterImage title={data.hotTake.item.title} year={data.hotTake.item.year} posterPath={data.hotTake.item.posterPath} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="text-text-primary font-display font-bold truncate">{data.hotTake.item.title}</p>
                    <p className="text-text-secondary text-xs font-body mt-1">
                      You gave it <span className="text-text-primary font-bold">{data.hotTake.mine.toFixed(1)}</span>. Binge says{" "}
                      <span className="text-text-primary font-bold">{data.hotTake.binge.toFixed(1)}</span>.
                    </p>
                    <p className="text-text-muted text-xs font-body mt-0.5">
                      {data.hotTake.mine > data.hotTake.binge ? "You saw something they didn't." : "Everyone else is wrong, apparently."}
                    </p>
                  </div>
                </div>
              </SmallCard>
            )}

            {/* Taste twin */}
            {twin && data.tasteTwin && (
              <button
                onClick={() => pushScreen({ screen: "profile", userId: twin.id })}
                className="w-full text-left bg-bg-card border border-border rounded-2xl p-4 flex items-center gap-3"
              >
                <div className="flex -space-x-3">
                  <UserAvatar user={currentUserData} size="md" ring />
                  <UserAvatar user={twin} size="md" ring />
                </div>
                <div className="flex-1">
                  <p className="text-text-muted text-[10px] font-body uppercase tracking-wider">Your taste twin</p>
                  <p className="text-text-primary font-display font-bold">
                    {twin.name.split(" ")[0]} · {data.tasteTwin.pct}% match
                  </p>
                </div>
              </button>
            )}

            {period.inProgress && (
              <p className="text-text-muted text-xs font-body text-center pt-2">
                {period.label} isn&apos;t over yet — this recap keeps updating as you rate.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Card({ tone, children }: { tone: "accent" | "gold"; children: React.ReactNode }) {
  return (
    <div
      className={`rounded-2xl p-5 border animate-fadeIn ${tone === "accent" ? "bg-accent/10 border-accent/30" : "bg-accent-gold/10 border-accent-gold/30"}`}
    >
      {children}
    </div>
  );
}

function Stat({ n, label }: { n: number; label: string }) {
  return (
    <div>
      <p className="text-text-primary font-mono font-semibold text-xl leading-none">{n}</p>
      <p className="text-text-muted text-xs font-body mt-1">{label}</p>
    </div>
  );
}

function SmallCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="bg-bg-card border border-border rounded-2xl p-4">
      <p className="text-text-muted text-[10px] font-body uppercase tracking-wider mb-2">{label}</p>
      {children}
    </div>
  );
}
