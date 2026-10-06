"use client";
import { useState } from "react";
import { useApp } from "@/lib/AppContext";
import { useSocial } from "@/lib/SocialContext";
import { average, bingeRating, friendRatingsFor, MIN_BINGE_RATINGS, type Kind } from "@/lib/social";
import RatingBadge from "@/components/RatingBadge";
import UserAvatar from "./UserAvatar";

/** You · Friends · Binge — three ratings side by side, friends first. */
export default function RatingsTrio({ type, id, myRating }: { type: Kind; id: string; myRating?: number }) {
  const { pushScreen } = useApp();
  const { followingIds, getUser, myRows } = useSocial();
  const [open, setOpen] = useState(false);

  const friendRows = friendRatingsFor(type, id, followingIds);
  const friendAvg = average(friendRows.map((r) => r.rating));
  const binge = bingeRating(type, id, myRows);
  const bingeShown = binge && binge.count >= MIN_BINGE_RATINGS;

  return (
    <div className="bg-bg-card rounded-2xl border border-border overflow-hidden">
      <div className="grid grid-cols-3 divide-x divide-border">
        <Cell label="You">
          {myRating != null ? <RatingBadge rating={myRating} size="md" /> : <Empty text="Not rated" />}
        </Cell>
        <button className="text-left active:bg-bg-elevated transition-colors" onClick={() => friendRows.length && setOpen((o) => !o)}>
          <Cell label="Friends">
            {friendAvg != null ? (
              <div className="flex flex-col items-center gap-1.5">
                <RatingBadge rating={friendAvg} size="md" />
                <div className="flex items-center">
                  <div className="flex -space-x-1.5">
                    {friendRows.slice(0, 3).map((r) => {
                      const u = getUser(r.userId);
                      return u ? <UserAvatar key={r.userId} user={u} size="xs" ring /> : null;
                    })}
                  </div>
                  <span className="text-text-muted text-[10px] font-body ml-1.5">
                    {friendRows.length} friend{friendRows.length === 1 ? "" : "s"}
                  </span>
                </div>
              </div>
            ) : (
              <Empty text="No friends yet" />
            )}
          </Cell>
        </button>
        <Cell label="Binge">
          {bingeShown ? (
            <div className="flex flex-col items-center gap-1.5">
              <RatingBadge rating={binge!.avg} size="md" />
              <span className="text-text-muted text-[10px] font-body">{binge!.count.toLocaleString()} ratings</span>
            </div>
          ) : (
            <Empty text={`Needs ${MIN_BINGE_RATINGS}+ ratings`} />
          )}
        </Cell>
      </div>

      {open && friendRows.length > 0 && (
        <div className="border-t border-border p-3 space-y-1 animate-fadeIn">
          {friendRows.map((r) => {
            const u = getUser(r.userId);
            if (!u) return null;
            return (
              <button
                key={r.userId}
                onClick={() => pushScreen({ screen: "profile", userId: r.userId })}
                className="w-full flex items-center gap-3 rounded-xl px-2 py-2 active:bg-bg-elevated text-left"
              >
                <UserAvatar user={u} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-text-primary text-sm font-display font-semibold truncate">{u.name}</p>
                  {r.review && <p className="text-text-secondary text-xs italic truncate">&ldquo;{r.review}&rdquo;</p>}
                </div>
                <RatingBadge rating={r.rating} size="sm" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Cell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-start gap-2 px-2 py-3.5 h-full">
      <p className="text-text-muted text-[10px] font-body uppercase tracking-wider">{label}</p>
      {children}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="text-text-muted text-[11px] font-body text-center leading-tight px-1 pt-1">{text}</p>;
}
