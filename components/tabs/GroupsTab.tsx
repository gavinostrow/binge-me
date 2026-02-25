"use client";
import { useState, useRef, useEffect } from "react";
import { useApp } from "@/lib/AppContext";
import { friends, currentUser } from "@/lib/mockData";
import { nowWatching } from "@/lib/mockGroups";
import { timeAgo, getInitial } from "@/lib/utils";
import RatingBadge from "@/components/RatingBadge";
import type { GroupClub, GroupMessage, Prediction } from "@/lib/types";

// ─── Avatar ───────────────────────────────────────────────────────────────────
const AVATAR_COLORS = ["#7C5CF6", "#EC4899", "#F59E0B", "#10B981", "#3B82F6", "#EF4444"];
function UserAvatar({ userId, size = "sm" }: { userId: string; size?: "sm" | "md" }) {
  const allUsers = [currentUser, ...friends];
  const user = allUsers.find((u) => u.id === userId);
  const colorIdx = parseInt(userId.replace(/\D/g, "")) % AVATAR_COLORS.length;
  const color = AVATAR_COLORS[colorIdx];
  const sizes = { sm: "w-7 h-7 text-xs", md: "w-9 h-9 text-sm" };
  return (
    <div
      className={`${sizes[size]} rounded-full flex items-center justify-center font-bold text-white flex-shrink-0`}
      style={{ backgroundColor: color }}
    >
      {user ? getInitial(user.name) : "?"}
    </div>
  );
}

function getUserName(userId: string) {
  const allUsers = [currentUser, ...friends];
  return allUsers.find((u) => u.id === userId)?.name ?? "Unknown";
}

// ─── Group List Card ──────────────────────────────────────────────────────────
function GroupListCard({ group, onOpen }: { group: GroupClub; onOpen: () => void }) {
  const lastMsg = group.messages[group.messages.length - 1];
  return (
    <button
      onClick={onOpen}
      className="w-full bg-bg-surface rounded-xl p-4 flex gap-3 active:scale-[0.98] transition-all text-left"
    >
      {/* Club type icon */}
      <div className="w-12 h-12 rounded-xl bg-bg-elevated flex items-center justify-center shrink-0">
        {group.clubType === "group-watch" ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <div className="flex items-center gap-2 min-w-0">
            <p className="font-display font-bold text-text-primary text-sm truncate">{group.name}</p>
            <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-bg-elevated text-text-muted shrink-0">
              {group.clubType === "group-watch" ? "Group Watch" : "Friends Club"}
            </span>
          </div>
          <span className="text-text-muted text-[10px] ml-2 shrink-0">
            {group.lastActivity ? timeAgo(group.lastActivity) : ""}
          </span>
        </div>

        {/* Currently watching */}
        {group.currentWatch && (
          <p className="text-accent-purple text-xs font-semibold truncate mb-0.5">
            Watching: {group.currentWatch.title}
            {group.currentWatch.episode && ` · ${group.currentWatch.episode}`}
          </p>
        )}

        {/* Last message */}
        {lastMsg && (
          <p className="text-text-secondary text-xs truncate">
            <span className="font-semibold text-text-muted">
              {lastMsg.userId === currentUser.id ? "You" : getUserName(lastMsg.userId).split(" ")[0]}:{" "}
            </span>
            {lastMsg.text}
          </p>
        )}

        {/* Members */}
        <div className="flex items-center gap-2 mt-2">
          <div className="flex -space-x-1.5">
            {group.memberIds.slice(0, 4).map((id) => (
              <div
                key={id}
                className="w-5 h-5 rounded-full border-2 border-bg-surface flex items-center justify-center text-[9px] font-bold text-white"
                style={{ backgroundColor: AVATAR_COLORS[parseInt(id.replace(/\D/g, "")) % AVATAR_COLORS.length] }}
              >
                {getInitial(getUserName(id))}
              </div>
            ))}
          </div>
          <span className="text-text-muted text-[10px]">{group.memberIds.length} members</span>
        </div>
      </div>
    </button>
  );
}

// ─── Chat Bubble ──────────────────────────────────────────────────────────────
function ChatBubble({ msg, groupId }: { msg: GroupMessage; groupId: string }) {
  const { toggleGroupReaction } = useApp();
  const isMe = msg.userId === currentUser.id;
  const [showPicker, setShowPicker] = useState(false);
  const reactionEntries = Object.entries(msg.reactions).filter(([, u]) => u.length > 0);
  const REACTIONS = ["fire", "haha", "wow", "sad", "clap", "eyes"];
  const REACTION_ICONS: Record<string, string> = {
    fire: "🔥", haha: "😂", wow: "😲", sad: "😭", clap: "👏", eyes: "👀",
  };

  return (
    <div className={`flex gap-2 items-end ${isMe ? "flex-row-reverse" : "flex-row"}`}>
      {!isMe && <UserAvatar userId={msg.userId} size="sm" />}
      <div className={`max-w-[78%] flex flex-col gap-1 ${isMe ? "items-end" : "items-start"}`}>
        {!isMe && (
          <span className="text-text-muted text-[10px] ml-1">{getUserName(msg.userId).split(" ")[0]}</span>
        )}
        {msg.contentRef && (
          <div className={`flex items-center gap-1 text-[10px] font-semibold mb-0.5 ${isMe ? "text-white/70" : "text-accent-purple"}`}>
            <span>{msg.contentRef.type === "movie" ? "Film" : "Show"}</span>
            <span>·</span>
            <span>{msg.contentRef.title}</span>
            {msg.contentRef.rating && <RatingBadge rating={msg.contentRef.rating} size="sm" />}
          </div>
        )}
        <button
          onClick={() => setShowPicker((v) => !v)}
          className={`rounded-2xl px-3.5 py-2.5 text-left text-sm leading-relaxed ${
            isMe
              ? "bg-accent-purple text-white rounded-br-sm"
              : "bg-bg-elevated text-text-primary rounded-bl-sm"
          }`}
          style={{ wordBreak: "break-word" }}
        >
          {msg.text}
        </button>
        {reactionEntries.length > 0 && (
          <div className={`flex gap-1 flex-wrap ${isMe ? "justify-end" : "justify-start"}`}>
            {reactionEntries.map(([emoji, users]) => (
              <button
                key={emoji}
                onClick={() => toggleGroupReaction(groupId, msg.id, emoji, currentUser.id)}
                className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs bg-bg-elevated border border-bg-hover"
              >
                <span>{emoji}</span>
                <span className="text-text-secondary text-[10px]">{users.length}</span>
              </button>
            ))}
          </div>
        )}
        {showPicker && (
          <div className={`flex gap-1 bg-bg-surface border border-bg-elevated rounded-2xl p-2 shadow-xl animate-scaleIn ${isMe ? "flex-row-reverse" : ""}`}>
            {REACTIONS.map((r) => (
              <button
                key={r}
                onClick={() => { toggleGroupReaction(groupId, msg.id, r, currentUser.id); setShowPicker(false); }}
                className="text-base w-8 h-8 flex items-center justify-center rounded-xl hover:bg-bg-elevated transition-all active:scale-90"
              >
                {REACTION_ICONS[r]}
              </button>
            ))}
          </div>
        )}
        <span className="text-text-muted text-[9px] px-1">{timeAgo(msg.timestamp)}</span>
      </div>
    </div>
  );
}

// ─── Prediction Card ──────────────────────────────────────────────────────────
function PredictionCard({ pred, groupId }: { pred: Prediction; groupId: string }) {
  const author = [currentUser, ...friends].find((u) => u.id === pred.userId);
  const isMe = pred.userId === currentUser.id;
  return (
    <div className="bg-bg-surface rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <UserAvatar userId={pred.userId} size="sm" />
        <div className="flex-1 min-w-0">
          <p className="text-text-primary text-xs font-semibold">{author?.displayName ?? author?.name ?? "Unknown"}</p>
          {pred.contentTitle && <p className="text-text-muted text-[10px]">{pred.contentTitle}</p>}
        </div>
        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
          pred.revealed
            ? pred.result === "correct" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
            : pred.locked ? "bg-accent-purple/20 text-accent-purple" : "bg-bg-elevated text-text-muted"
        }`}>
          {pred.revealed ? (pred.result === "correct" ? "Correct" : "Wrong") : pred.locked ? "Locked" : "Open"}
        </span>
      </div>
      <p className="text-text-primary text-sm leading-relaxed">{pred.text}</p>
      {pred.lockedAt && (
        <p className="text-text-muted text-[10px] mt-2">Locked {timeAgo(pred.lockedAt)}</p>
      )}
    </div>
  );
}

// ─── Fav Character Entry ──────────────────────────────────────────────────────
interface FavCharEntry {
  id: string;
  userId: string;
  character: string;
  from: string;
  reason?: string;
  timestamp: string;
}

function FavCharCard({ entry }: { entry: FavCharEntry }) {
  const author = [currentUser, ...friends].find((u) => u.id === entry.userId);
  return (
    <div className="bg-bg-surface rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <UserAvatar userId={entry.userId} size="sm" />
        <div>
          <p className="text-text-primary text-xs font-semibold">{author?.displayName ?? author?.name}</p>
          <p className="text-text-muted text-[10px]">{timeAgo(entry.timestamp)}</p>
        </div>
      </div>
      <p className="text-text-primary text-sm font-semibold">{entry.character}</p>
      <p className="text-text-muted text-xs mt-0.5">from {entry.from}</p>
      {entry.reason && <p className="text-text-secondary text-xs mt-1.5 leading-relaxed">{entry.reason}</p>}
    </div>
  );
}

// ─── Chat View (with 3 tabs) ──────────────────────────────────────────────────
type ChatTab = "chat" | "predictions" | "characters";

function ChatView({ group, onBack }: { group: GroupClub; onBack: () => void }) {
  const { sendGroupMessage } = useApp();
  const [chatTab, setChatTab] = useState<ChatTab>("chat");
  const [input, setInput] = useState("");
  const [predInput, setPredInput] = useState("");
  const [predTitle, setPredTitle] = useState("");
  const [showPredForm, setShowPredForm] = useState(false);
  const [charInput, setCharInput] = useState("");
  const [charFrom, setCharFrom] = useState("");
  const [charReason, setCharReason] = useState("");
  const [showCharForm, setShowCharForm] = useState(false);
  const [localPreds, setLocalPreds] = useState<Prediction[]>(group.predictions);
  const [localChars, setLocalChars] = useState<FavCharEntry[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [group.messages.length, chatTab]);

  function sendMessage() {
    const text = input.trim();
    if (!text) return;
    sendGroupMessage(group.id, {
      id: `msg_${Date.now()}`,
      userId: currentUser.id,
      text,
      timestamp: new Date().toISOString(),
      reactions: {},
    });
    setInput("");
  }

  function addPrediction() {
    if (!predInput.trim()) return;
    const newPred: Prediction = {
      id: `pred_${Date.now()}`,
      userId: currentUser.id,
      text: predInput.trim(),
      contentTitle: predTitle.trim() || undefined,
      locked: false,
      revealed: false,
    };
    setLocalPreds((p) => [newPred, ...p]);
    setPredInput("");
    setPredTitle("");
    setShowPredForm(false);
  }

  function addCharEntry() {
    if (!charInput.trim() || !charFrom.trim()) return;
    const entry: FavCharEntry = {
      id: `char_${Date.now()}`,
      userId: currentUser.id,
      character: charInput.trim(),
      from: charFrom.trim(),
      reason: charReason.trim() || undefined,
      timestamp: new Date().toISOString(),
    };
    setLocalChars((c) => [entry, ...c]);
    setCharInput("");
    setCharFrom("");
    setCharReason("");
    setShowCharForm(false);
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-bg-elevated">
        <button
          onClick={onBack}
          className="w-8 h-8 rounded-full bg-bg-elevated flex items-center justify-center active:opacity-70 transition-opacity shrink-0"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div className="flex-1 min-w-0">
          <p className="font-display font-bold text-text-primary text-sm truncate">{group.name}</p>
          <p className="text-text-muted text-xs">{group.memberIds.length} members</p>
        </div>
      </div>

      {/* Currently watching banner */}
      {group.currentWatch && (
        <div className="mx-4 mt-2 bg-accent-purple/10 border border-accent-purple/30 rounded-xl px-3 py-2">
          <p className="text-accent-purple text-xs font-semibold truncate">
            Now watching: {group.currentWatch.title}
            {group.currentWatch.episode && ` — ${group.currentWatch.episode}`}
          </p>
        </div>
      )}

      {/* 3-tab switcher */}
      <div className="flex border-b border-bg-elevated px-4 mt-2">
        {(["chat", "predictions", "characters"] as ChatTab[]).map((t) => (
          <button
            key={t}
            onClick={() => setChatTab(t)}
            className={`mr-5 pb-2.5 text-xs font-semibold transition-colors ${
              chatTab === t ? "text-text-primary border-b-2 border-accent-purple" : "text-text-muted"
            }`}
          >
            {t === "chat" ? "Chat" : t === "predictions" ? "Predictions" : "Fav Characters"}
          </button>
        ))}
      </div>

      {/* ── Chat Tab ── */}
      {chatTab === "chat" && (
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3">
            {group.messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-16 text-center text-text-muted">
                <p className="text-sm font-semibold">No messages yet</p>
                <p className="text-xs mt-1">Start the conversation</p>
              </div>
            ) : (
              group.messages.map((msg) => <ChatBubble key={msg.id} msg={msg} groupId={group.id} />)
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t border-bg-elevated flex items-end gap-2">
            <div className="flex-1 bg-bg-elevated rounded-2xl flex items-end px-3 py-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder="Message..."
                rows={1}
                className="flex-1 bg-transparent text-text-primary text-sm placeholder-text-muted resize-none outline-none max-h-24"
                style={{ lineHeight: "1.4" }}
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all active:scale-95 disabled:opacity-40 bg-accent-purple"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* ── Predictions Tab ── */}
      {chatTab === "predictions" && (
        <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3">
          <button
            onClick={() => setShowPredForm((v) => !v)}
            className="w-full py-2.5 rounded-xl border border-accent-purple/40 text-accent-purple text-sm font-semibold active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            Log a Prediction
          </button>

          {showPredForm && (
            <div className="bg-bg-elevated rounded-xl p-4 flex flex-col gap-3 animate-fadeIn">
              <input
                type="text"
                value={predTitle}
                onChange={(e) => setPredTitle(e.target.value)}
                placeholder="What show or movie? (optional)"
                className="w-full bg-bg-surface rounded-xl px-3 py-2.5 text-text-primary text-sm placeholder-text-muted outline-none"
              />
              <textarea
                autoFocus
                value={predInput}
                onChange={(e) => setPredInput(e.target.value)}
                placeholder="Your prediction..."
                rows={3}
                className="w-full bg-bg-surface rounded-xl px-3 py-2.5 text-text-primary text-sm placeholder-text-muted resize-none outline-none"
              />
              <div className="flex gap-2">
                <button onClick={() => setShowPredForm(false)} className="flex-1 py-2 rounded-xl border border-bg-hover text-text-muted text-sm font-semibold">Cancel</button>
                <button
                  onClick={addPrediction}
                  disabled={!predInput.trim()}
                  className="flex-1 py-2 rounded-xl bg-accent-purple text-white text-sm font-semibold disabled:opacity-40 active:scale-95 transition-all"
                >
                  Lock In
                </button>
              </div>
            </div>
          )}

          {localPreds.length === 0 && !showPredForm && (
            <div className="text-center text-text-muted text-sm py-8">No predictions yet. Be first.</div>
          )}

          {localPreds.map((pred) => (
            <PredictionCard key={pred.id} pred={pred} groupId={group.id} />
          ))}
        </div>
      )}

      {/* ── Fav Characters Tab ── */}
      {chatTab === "characters" && (
        <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3">
          <button
            onClick={() => setShowCharForm((v) => !v)}
            className="w-full py-2.5 rounded-xl border border-accent-purple/40 text-accent-purple text-sm font-semibold active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            Add a Favorite Character
          </button>

          {showCharForm && (
            <div className="bg-bg-elevated rounded-xl p-4 flex flex-col gap-3 animate-fadeIn">
              <input
                type="text"
                value={charInput}
                onChange={(e) => setCharInput(e.target.value)}
                placeholder="Character name"
                className="w-full bg-bg-surface rounded-xl px-3 py-2.5 text-text-primary text-sm placeholder-text-muted outline-none"
              />
              <input
                type="text"
                value={charFrom}
                onChange={(e) => setCharFrom(e.target.value)}
                placeholder="From (show or movie)"
                className="w-full bg-bg-surface rounded-xl px-3 py-2.5 text-text-primary text-sm placeholder-text-muted outline-none"
              />
              <textarea
                value={charReason}
                onChange={(e) => setCharReason(e.target.value)}
                placeholder="Why? (optional)"
                rows={2}
                className="w-full bg-bg-surface rounded-xl px-3 py-2.5 text-text-primary text-sm placeholder-text-muted resize-none outline-none"
              />
              <div className="flex gap-2">
                <button onClick={() => setShowCharForm(false)} className="flex-1 py-2 rounded-xl border border-bg-hover text-text-muted text-sm font-semibold">Cancel</button>
                <button
                  onClick={addCharEntry}
                  disabled={!charInput.trim() || !charFrom.trim()}
                  className="flex-1 py-2 rounded-xl bg-accent-purple text-white text-sm font-semibold disabled:opacity-40 active:scale-95 transition-all"
                >
                  Add
                </button>
              </div>
            </div>
          )}

          {localChars.length === 0 && !showCharForm && (
            <div className="text-center text-text-muted text-sm py-8">No characters logged yet.</div>
          )}

          {localChars.map((entry) => (
            <FavCharCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Create Club Modal ────────────────────────────────────────────────────────
function CreateClubModal({ onClose, onCreate }: { onClose: () => void; onCreate: (name: string, type: "group-watch" | "friends-club") => void }) {
  const [name, setName] = useState("");
  const [type, setType] = useState<"group-watch" | "friends-club">("group-watch");

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-app mx-auto bg-bg-surface rounded-t-3xl p-5 pb-10 animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-bg-elevated rounded-full mx-auto mb-5" />
        <h2 className="font-display font-bold text-text-primary text-xl mb-5">Create a Club</h2>

        {/* Type selection */}
        <p className="text-text-muted text-xs font-semibold uppercase tracking-widest mb-3">Type</p>
        <div className="flex gap-3 mb-5">
          <button
            onClick={() => setType("group-watch")}
            className={`flex-1 rounded-xl border p-4 text-left transition-all ${
              type === "group-watch" ? "border-accent-purple bg-accent-purple/10" : "border-bg-elevated"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={type === "group-watch" ? "#8B5CF6" : "#5E586E"} strokeWidth="2" strokeLinecap="round">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              <span className={`text-sm font-semibold ${type === "group-watch" ? "text-accent-purple" : "text-text-primary"}`}>Group Watch</span>
            </div>
            <p className="text-text-muted text-xs">Watch and discuss together in real time</p>
          </button>

          <button
            onClick={() => setType("friends-club")}
            className={`flex-1 rounded-xl border p-4 text-left transition-all ${
              type === "friends-club" ? "border-accent-purple bg-accent-purple/10" : "border-bg-elevated"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={type === "friends-club" ? "#8B5CF6" : "#5E586E"} strokeWidth="2" strokeLinecap="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <span className={`text-sm font-semibold ${type === "friends-club" ? "text-accent-purple" : "text-text-primary"}`}>Friends Club</span>
            </div>
            <p className="text-text-muted text-xs">Share ratings and recs with your crew</p>
          </button>
        </div>

        {/* Name input */}
        <p className="text-text-muted text-xs font-semibold uppercase tracking-widest mb-2">Name</p>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Movie Night Crew"
          className="w-full bg-bg-elevated rounded-xl px-4 py-3 text-text-primary text-sm placeholder-text-muted outline-none mb-5"
          autoFocus
        />

        <button
          onClick={() => { if (name.trim()) { onCreate(name.trim(), type); onClose(); } }}
          disabled={!name.trim()}
          className="w-full py-4 rounded-2xl font-display font-bold text-white text-base transition-all active:scale-95 disabled:opacity-40 bg-accent-purple"
        >
          Create Club
        </button>
      </div>
    </div>
  );
}

// ─── Main GroupsTab ────────────────────────────────────────────────────────────
export default function GroupsTab() {
  const { groups, createGroup } = useApp();
  const [selectedGroup, setSelectedGroup] = useState<GroupClub | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  function handleCreate(name: string, type: "group-watch" | "friends-club") {
    createGroup({
      id: `group_${Date.now()}`,
      name,
      emoji: "",
      clubType: type,
      memberIds: [currentUser.id],
      messages: [],
      predictions: [],
      polls: [],
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
    });
  }

  // Full-screen chat view
  if (selectedGroup) {
    return (
      <div className="flex flex-col h-screen pb-20">
        <ChatView group={selectedGroup} onBack={() => setSelectedGroup(null)} />
      </div>
    );
  }

  return (
    <div className="flex flex-col pb-24">
      {/* Header */}
      <div className="px-4 pt-5 pb-4 flex items-center justify-between">
        <h1 className="font-display font-bold text-2xl text-text-primary">Clubs</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 bg-accent-purple/15 text-accent-purple px-3.5 py-2 rounded-full text-sm font-semibold active:scale-95 transition-all"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Club
        </button>
      </div>

      {/* Groups list */}
      {groups.length === 0 ? (
        <div className="px-4 py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-bg-elevated flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#5E586E" strokeWidth="2" strokeLinecap="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <p className="text-text-primary font-semibold text-base mb-1">No clubs yet</p>
          <p className="text-text-muted text-sm mb-5">Create one to watch and discuss with friends</p>
          <button
            onClick={() => setShowCreate(true)}
            className="bg-accent-purple text-white px-6 py-3 rounded-xl text-sm font-semibold active:scale-95 transition-all"
          >
            Create your first club
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5 px-4">
          {groups.map((group) => (
            <GroupListCard key={group.id} group={group} onOpen={() => setSelectedGroup(group)} />
          ))}
        </div>
      )}

      {showCreate && (
        <CreateClubModal
          onClose={() => setShowCreate(false)}
          onCreate={handleCreate}
        />
      )}
    </div>
  );
}
