"use client";
import { useMemo, useState } from "react";
import { useApp } from "@/lib/AppContext";
import { useSocial } from "@/lib/SocialContext";
import { getShow } from "@/lib/catalog";
import { pastPredictionRecord, type PredictionQuestion } from "@/lib/socialData";
import PosterImage from "@/components/PosterImage";
import ScreenHeader from "@/components/social/ScreenHeader";
import UserAvatar from "@/components/social/UserAvatar";

const ME = "u1";

function lockLabel(locksAt: string) {
  const ms = new Date(locksAt).getTime() - Date.now();
  if (ms <= 0) return "Locked";
  const h = Math.floor(ms / 3600000);
  if (h < 1) return `Locks in ${Math.max(1, Math.floor(ms / 60000))}m`;
  if (h < 48) return `Locks in ${h}h`;
  return `Locks in ${Math.floor(h / 24)} days`;
}

/** Predictions for scripted shows: pick before it airs, see who called it. */
export default function PredictionsScreen({ showId }: { showId?: string }) {
  const { pushScreen } = useApp();
  const { questions, picks, makePick, getUser, followingIds, showToast } = useSocial();
  const [filter, setFilter] = useState<string | null>(showId ?? null);

  const showIds = Array.from(new Set(questions.map((q) => q.showId)));
  const visible = questions.filter((q) => !filter || q.showId === filter);
  const now = Date.now();
  const open = visible.filter((q) => new Date(q.locksAt).getTime() > now);
  const waiting = visible.filter((q) => new Date(q.locksAt).getTime() <= now && !q.answer);
  const resolved = visible.filter((q) => q.answer);

  const leaderboard = useMemo(() => {
    const people = [ME, ...followingIds];
    return people
      .map((id) => {
        const base = pastPredictionRecord[id] ?? { right: 0, total: 0 };
        let right = base.right;
        let total = base.total;
        questions.forEach((q) => {
          const pick = picks[q.id]?.[id];
          if (q.answer && pick) {
            total += 1;
            if (pick === q.answer) right += 1;
          }
        });
        return { id, right, total, pct: total ? Math.round((right / total) * 100) : 0 };
      })
      .filter((r) => r.total > 0)
      .sort((a, b) => b.pct - a.pct || b.right - a.right);
  }, [questions, picks, followingIds]);

  const title = filter ? getShow(filter)?.title ?? "Predictions" : "Predictions";

  return (
    <div className="flex flex-col h-full overflow-y-auto scrollbar-hide bg-bg-primary">
      <ScreenHeader title={title} subtitle="Call it before it airs. Picks stay hidden until they lock." />

      <div className="px-4 pt-3 pb-28 space-y-5">
        {/* Show filter */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4">
          <Chip active={!filter} onClick={() => setFilter(null)}>
            All shows
          </Chip>
          {showIds.map((id) => (
            <Chip key={id} active={filter === id} onClick={() => setFilter(id)}>
              {getShow(id)?.title ?? id}
            </Chip>
          ))}
        </div>

        {/* Leaderboard */}
        {leaderboard.length > 0 && (
          <div className="bg-bg-card border border-border rounded-2xl p-4">
            <p className="text-text-muted text-xs font-body uppercase tracking-wider mb-3">Friends leaderboard</p>
            <div className="space-y-2">
              {leaderboard.slice(0, 6).map((r, i) => {
                const u = getUser(r.id);
                if (!u) return null;
                const isMe = r.id === ME;
                return (
                  <div key={r.id} className={`flex items-center gap-3 rounded-xl px-2 py-1.5 ${isMe ? "bg-accent/10" : ""}`}>
                    <span className={`w-5 text-center font-display font-bold text-sm ${i === 0 ? "text-accent-gold" : "text-text-muted"}`}>{i + 1}</span>
                    <UserAvatar user={u} size="sm" />
                    <p className="flex-1 text-text-primary text-sm font-body font-semibold truncate">{isMe ? "You" : u.name}</p>
                    <span className="text-text-secondary text-xs font-body">
                      {r.right}/{r.total}
                    </span>
                    <span className="w-10 text-right text-text-primary text-sm font-display font-bold">{r.pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {open.length > 0 && (
          <Section title="Open — make your pick">
            {open.map((q) => (
              <QuestionCard
                key={q.id}
                q={q}
                showTitle={!filter}
                picks={picks[q.id] ?? {}}
                onPick={(opt) => {
                  makePick(q.id, opt);
                  showToast("Pick locked in — you can change it until it locks");
                }}
                onOpenShow={() => pushScreen({ screen: "show-detail", showId: q.showId })}
              />
            ))}
          </Section>
        )}

        {waiting.length > 0 && (
          <Section title="Locked — waiting for the episode">
            {waiting.map((q) => (
              <QuestionCard key={q.id} q={q} showTitle={!filter} picks={picks[q.id] ?? {}} onOpenShow={() => pushScreen({ screen: "show-detail", showId: q.showId })} />
            ))}
          </Section>
        )}

        {resolved.length > 0 && (
          <Section title="Results">
            {resolved.map((q) => (
              <QuestionCard key={q.id} q={q} showTitle={!filter} picks={picks[q.id] ?? {}} onOpenShow={() => pushScreen({ screen: "show-detail", showId: q.showId })} />
            ))}
          </Section>
        )}

        {visible.length === 0 && <p className="text-text-secondary text-sm text-center py-10">No predictions for this show yet.</p>}
      </div>
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-body font-semibold border transition-colors ${
        active ? "bg-accent border-accent text-white" : "border-border text-text-secondary"
      }`}
    >
      {children}
    </button>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-text-muted text-xs font-body uppercase tracking-wider mb-2">{title}</p>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function QuestionCard({
  q,
  picks,
  onPick,
  showTitle,
  onOpenShow,
}: {
  q: PredictionQuestion;
  picks: Record<string, string>;
  onPick?: (optionId: string) => void;
  showTitle: boolean;
  onOpenShow: () => void;
}) {
  const { getUser, followingIds } = useSocial();
  const show = getShow(q.showId);
  const locked = new Date(q.locksAt).getTime() <= Date.now();
  const mine = picks[ME];
  const friendPickers = Object.keys(picks).filter((id) => id !== ME && followingIds.includes(id));
  const reveal = locked; // friends' picks only become visible after the lock

  return (
    <div className="bg-bg-card border border-border rounded-2xl p-4">
      <div className="flex items-start gap-3 mb-3">
        {showTitle && show && (
          <PosterImage title={show.title} year={show.year} posterPath={show.posterPath} size="sm" onClick={onOpenShow} />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-text-muted text-[10px] font-body uppercase tracking-wider">
            {showTitle && show ? `${show.title} · ` : ""}
            {q.label}
          </p>
          <p className="text-text-primary font-display font-bold leading-snug mt-0.5">{q.question}</p>
        </div>
      </div>

      <div className="space-y-2">
        {q.options.map((o) => {
          const isMine = mine === o.id;
          const isAnswer = q.answer === o.id;
          const whoPicked = reveal ? friendPickers.filter((id) => picks[id] === o.id) : [];
          const totalVotes = Object.keys(picks).length || 1;
          const share = reveal ? Math.round((Object.values(picks).filter((p) => p === o.id).length / totalVotes) * 100) : 0;
          return (
            <button
              key={o.id}
              disabled={!onPick || locked}
              onClick={() => onPick?.(o.id)}
              className={`relative w-full overflow-hidden rounded-xl border px-3 py-2.5 text-left transition-colors ${
                isAnswer
                  ? "border-rating-green bg-rating-green/10"
                  : isMine
                    ? "border-accent bg-accent/10"
                    : "border-border bg-bg-elevated"
              }`}
            >
              {reveal && <span className="absolute inset-y-0 left-0 bg-white/5" style={{ width: `${share}%` }} aria-hidden />}
              <span className="relative flex items-center gap-2">
                <span className="flex-1 text-sm font-body font-semibold text-text-primary">
                  {o.label}
                  {isAnswer && <span className="text-rating-green ml-1.5">✓</span>}
                </span>
                {whoPicked.length > 0 && (
                  <span className="flex -space-x-1.5">
                    {whoPicked.slice(0, 4).map((id) => {
                      const u = getUser(id);
                      return u ? <UserAvatar key={id} user={u} size="xs" ring /> : null;
                    })}
                  </span>
                )}
                {isMine && <span className="text-[10px] font-body font-bold text-accent-light">YOU</span>}
                {reveal && <span className="text-[11px] text-text-muted font-body w-8 text-right">{share}%</span>}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between mt-3">
        <span className="text-text-muted text-[11px] font-body">
          {reveal
            ? q.answer
              ? mine
                ? mine === q.answer
                  ? "You called it."
                  : "Not this time."
                : "You didn't pick."
              : "Picks revealed · waiting for the episode"
            : `${friendPickers.length} friend${friendPickers.length === 1 ? "" : "s"} picked · hidden until lock`}
        </span>
        <span className={`text-[11px] font-body font-semibold ${locked ? "text-text-muted" : "text-accent-gold"}`}>{lockLabel(q.locksAt)}</span>
      </div>
    </div>
  );
}
