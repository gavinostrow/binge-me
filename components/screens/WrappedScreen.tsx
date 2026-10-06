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
  const { movieRatings, showRatings, pushScreen, currentUserData } = useApp();
  const { myRows, followingIds, getUser, showToast } = useSocial();
  const now = new Date();
  const [year, setYear] = useState(initial ? Number(initial.slice(0, 4)) : now.getFullYear());
  const periods = periodsFor(year, now);
  const [key, setKey] = useState(initial && periods.some((p) => p.key === initial) ? initial : periods[0].key);
  const period = periods.find((p) => p.key === key) ?? periods[0];

  const data = useMemo(
    () => computeWrapped(period, movieRatings, showRatings, myRows, followingIds),
    [period, movieRatings, showRatings, myRows, followingIds],
  );

  const share = async () => {
    if (!data) return;
    const lines = [
      `My Binge Wrapped · ${period.label}`,
      `${data.total} titles · ~${data.hours} hours`,
      data.topShow ? `#1 show: ${data.topShow.item.title} (${data.topShow.rating.toFixed(1)})` : "",
      data.topMovie ? `#1 movie: ${data.topMovie.item.title} (${data.topMovie.rating.toFixed(1)})` : "",
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
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-display font-bold border transition-colors ${
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
            <Card gradient="from-[#8B5CF6] via-[#6D28D9] to-[#1C1C28]">
              <p className="text-white/70 text-xs font-body uppercase tracking-[0.2em]">{period.label}</p>
              <p className="text-white font-display font-black text-6xl leading-none mt-4">{data.total}</p>
              <p className="text-white font-display font-bold text-xl mt-1">titles logged</p>
              <div className="flex gap-6 mt-6">
                <Stat n={data.shows} label="shows" />
                <Stat n={data.seasons} label="seasons" />
                <Stat n={data.movies} label="movies" />
              </div>
              <p className="text-white/80 text-sm font-body mt-6">
                About <span className="font-bold text-white">{data.hours} hours</span> of watching
                {data.hours >= 24 ? ` — that's ${(data.hours / 24).toFixed(1)} full days` : ""}.
              </p>
            </Card>

            {/* Persona */}
            <Card gradient="from-[#D4A843] via-[#B45309] to-[#1C1C28]">
              <p className="text-white/70 text-xs font-body uppercase tracking-[0.2em]">Your watcher type</p>
              <p className="text-white font-display font-black text-3xl leading-tight mt-3">{data.persona.title}</p>
              <p className="text-white/85 text-sm font-body mt-1">{data.persona.line}</p>
              <p className="text-white/85 text-sm font-body mt-4">
                Average rating <span className="font-display font-bold text-white text-lg">{data.avg.toFixed(1)}</span>
              </p>
            </Card>

            {/* Top show / movie */}
            {(data.topShow || data.topMovie) && (
              <div className="grid grid-cols-2 gap-3">
                {data.topShow && (
                  <TopPick
                    label="#1 show"
                    title={data.topShow.item.title}
                    year={data.topShow.item.year}
                    posterPath={data.topShow.item.posterPath}
                    rating={data.topShow.rating}
                    onClick={() => pushScreen({ screen: "show-detail", showId: data.topShow!.item.id })}
                  />
                )}
                {data.topMovie && (
                  <TopPick
                    label="#1 movie"
                    title={data.topMovie.item.title}
                    year={data.topMovie.item.year}
                    posterPath={data.topMovie.item.posterPath}
                    rating={data.topMovie.rating}
                    onClick={() => pushScreen({ screen: "movie-detail", movieId: data.topMovie!.item.id })}
                  />
                )}
              </div>
            )}

            {/* Genre + platform */}
            <div className="grid grid-cols-2 gap-3">
              {data.topGenre && (
                <SmallCard label="Top genre">
                  <p className="text-text-primary font-display font-black text-2xl leading-tight">{data.topGenre.name}</p>
                  <p className="text-text-secondary text-xs font-body mt-1">{data.topGenre.share}% of what you watched</p>
                </SmallCard>
              )}
              {data.topPlatform && (
                <SmallCard label="Most-watched on">
                  <p className="text-text-primary font-display font-black text-2xl leading-tight">{data.topPlatform.name}</p>
                  <p className="text-text-secondary text-xs font-body mt-1">
                    {data.topPlatform.count} title{data.topPlatform.count === 1 ? "" : "s"}
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

function Card({ gradient, children }: { gradient: string; children: React.ReactNode }) {
  return <div className={`rounded-3xl p-6 bg-gradient-to-br ${gradient} animate-fadeIn`}>{children}</div>;
}

function Stat({ n, label }: { n: number; label: string }) {
  return (
    <div>
      <p className="text-white font-display font-black text-2xl leading-none">{n}</p>
      <p className="text-white/70 text-xs font-body mt-1">{label}</p>
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

function TopPick({
  label,
  title,
  year,
  posterPath,
  rating,
  onClick,
}: {
  label: string;
  title: string;
  year: number;
  posterPath?: string;
  rating: number;
  onClick: () => void;
}) {
  return (
    <button onClick={onClick} className="text-left bg-bg-card border border-border rounded-2xl p-3 active:bg-bg-elevated">
      <p className="text-text-muted text-[10px] font-body uppercase tracking-wider mb-2">{label}</p>
      <PosterImage title={title} year={year} posterPath={posterPath} size="xl" className="rounded-xl" />
      <div className="flex items-center justify-between gap-2 mt-2">
        <p className="text-text-primary text-sm font-display font-bold truncate">{title}</p>
        <RatingBadge rating={rating} size="sm" />
      </div>
    </button>
  );
}
