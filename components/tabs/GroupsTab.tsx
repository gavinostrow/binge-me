"use client";
import { useState, useRef, useEffect } from "react";
import { useApp } from "@/lib/AppContext";
import { friends, currentUser, feedActivities } from "@/lib/mockData";
import { nowWatching } from "@/lib/mockGroups";
import { timeAgo, getInitial } from "@/lib/utils";
import RatingBadge from "@/components/RatingBadge";
import type { GroupClub, GroupMessage, Prediction, GroupView, GroupPoll } from "@/lib/types";
// ─── Avatar ───────────────────────────────────────────────────────────────────
const AVATAR_COLORS = ["#7C5CF6", "#EC4899", "#F59E0B", "#10B981", "#3B82F6", "#EF4444"];
function UserAvatar({ userId, size = "sm" }: { userId: string; size?: "sm" | "md" | "lg" }) {
  const allUsers = [currentUser, ...friends];
  const user = allUsers.find((u) => u.id === userId);
  const colorIdx = parseInt(userId.replace(/\D/g, "")) % AVATAR_COLORS.length;
  const color = AVATAR_COLORS[colorIdx];
  const sizes = { sm: "w-7 h-7 text-xs", md: "w-9 h-9 text-sm", lg: "w-12 h-12 text-base" };
  return (
    <div
      className={`${sizes[size]} rounded-full flex items-center justify-center font-display font-bold text-white flex-shrink-0`}
      style={{ backgroundColor: color }}
    >
      {" "}
      {user ? getInitial(user.name) : "?"}{" "}
    </div>
  );
}
function getUserName(userId: string) {
  const allUsers = [currentUser, ...friends];
  return allUsers.find((u) => u.id === userId)?.name ?? "Unknown";
}
// ─── Group List Card ──────────────────────────────────────────────────────────
function GroupListCard({ group, onOpen }: { group: GroupClub; onOpen: () => void }) {
  const unreadCount = group.messages.filter((m) => m.userId !== currentUser.id).length;
  const lastMsg = group.messages[group.messages.length - 1];
  const pendingPredictions = group.predictions.filter((p) => !p.revealed && !p.locked).length;
  return (
    <button
      onClick={onOpen}
      className="w-full bg-bg-card rounded-2xl p-4 border border-border flex gap-3 active:scale-[0.98] transition-all text-left"
    >
      {" "}
      {/* Emoji */}{" "}
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
        style={{
          background: "linear-gradient(135deg, #252540, #1C1C2E)",
          border: "1px solid #35355A",
        }}
      >
        {" "}
        {group.emoji}{" "}
      </div>{" "}
      <div className="flex-1 min-w-0">
        {" "}
        <div className="flex items-center justify-between">
          {" "}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {" "}
            <p className="font-display font-bold text-text-primary text-sm truncate">
              {group.name}
            </p>{" "}
            {group.clubType && (
              <span className="text-[9px] font-body font-semibold px-2 py-0.5 rounded-full bg-bg-elevated border border-border text-text-secondary flex-shrink-0">
                {" "}
                {group.clubType === "group-watch" ? "Group Watch" : "Friends Club"}{" "}
              </span>
            )}{" "}
          </div>{" "}
          <span className="text-text-muted text-[10px] font-body ml-2 flex-shrink-0">
            {" "}
            {group.lastActivity ? timeAgo(group.lastActivity) : ""}{" "}
          </span>{" "}
        </div>{" "}
        {/* Currently watching pill */}{" "}
        {group.currentWatch && (
          <div className="flex items-center gap-1 mt-1">
            {" "}
            <span className="text-xs">{group.currentWatch.type === "show" ? "📺" : "🎬"}</span>{" "}
            <span className="text-accent text-xs font-body font-semibold truncate">
              {" "}
              {group.currentWatch.title}{" "}
              {group.currentWatch.episode && ` · ${group.currentWatch.episode}`}{" "}
            </span>{" "}
          </div>
        )}{" "}
        {/* Last message preview */}{" "}
        {lastMsg && (
          <p className="text-text-secondary text-xs font-body mt-1 truncate">
            {" "}
            <span className="font-semibold text-text-primary">
              {" "}
              {lastMsg.userId === currentUser.id
                ? "You"
                : getUserName(lastMsg.userId).split(" ")[0]}
              :{" "}
            </span>{" "}
            {lastMsg.text}{" "}
          </p>
        )}{" "}
        {/* Meta row */}{" "}
        <div className="flex items-center gap-3 mt-2">
          {" "}
          {/* Member avatars */}{" "}
          <div className="flex -space-x-1.5">
            {" "}
            {group.memberIds.slice(0, 4).map((id) => (
              <div
                key={id}
                className="w-5 h-5 rounded-full border-2 border-bg-card flex items-center justify-center text-[9px] font-bold text-white"
                style={{
                  backgroundColor:
                    AVATAR_COLORS[parseInt(id.replace(/\D/g, "")) % AVATAR_COLORS.length],
                }}
              >
                {" "}
                {getInitial(getUserName(id))}{" "}
              </div>
            ))}{" "}
          </div>{" "}
          <span className="text-text-muted text-[10px] font-body">
            {group.memberIds.length} members
          </span>{" "}
          {pendingPredictions > 0 && (
            <span className="text-[10px] font-body font-semibold px-1.5 py-0.5 rounded-full bg-accent/20 text-accent">
              {" "}
              🔮 {pendingPredictions} open{" "}
            </span>
          )}{" "}
        </div>{" "}
      </div>{" "}
    </button>
  );
}
// ─── Poll Rendering ───────────────────────────────────────────────────────────
function PollMessage({ poll, groupId }: { poll: GroupPoll; groupId: string }) {
  const { voteGroupPoll } = useApp();
  const userVote = poll.options.find((opt) => opt.votes.includes(currentUser.id));
  const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes.length, 0);
  return (
    <div className="bg-bg-elevated border border-border rounded-2xl p-4">
      {" "}
      <p className="font-display font-semibold text-text-primary text-sm mb-3">
        {poll.question}
      </p>{" "}
      <div className="flex flex-col gap-2">
        {" "}
        {poll.options.map((option) => {
          const optionVotes = option.votes.length;
          const percentage = totalVotes > 0 ? Math.round((optionVotes / totalVotes) * 100) : 0;
          const isUserVote = userVote?.id === option.id;
          return (
            <button
              key={option.id}
              onClick={() => voteGroupPoll(groupId, poll.id, option.id, currentUser.id)}
              className={`relative overflow-hidden rounded-xl p-3 text-left transition-all ${isUserVote ? "border border-accent bg-accent/10" : "border border-border bg-bg-card hover:border-border/80"}`}
            >
              {" "}
              {/* Vote bar background */}{" "}
              <div
                className={`absolute inset-0 ${isUserVote ? "bg-accent/20" : "bg-bg-elevated"}`}
                style={{ width: `${percentage}%` }}
              />{" "}
              {/* Content */}{" "}
              <div className="relative flex items-center justify-between">
                {" "}
                <span
                  className={`text-sm font-body ${isUserVote ? "text-accent font-semibold" : "text-text-primary"}`}
                >
                  {" "}
                  {option.text}{" "}
                </span>{" "}
                <span
                  className={`text-xs font-body font-semibold ${isUserVote ? "text-accent" : "text-text-muted"}`}
                >
                  {" "}
                  {percentage}% ({optionVotes}){" "}
                </span>{" "}
              </div>{" "}
            </button>
          );
        })}{" "}
      </div>{" "}
      {totalVotes > 0 && (
        <p className="text-text-muted text-xs font-body mt-3 text-center">
          {totalVotes} total votes
        </p>
      )}{" "}
    </div>
  );
}
// ─── Chat View ────────────────────────────────────────────────────────────────
const CHAT_REACTIONS = ["🔥", "❤️", "😂", "👏", "😭", "🫣", "💀", "👀"];
function ChatBubble({ msg, groupId }: { msg: GroupMessage; groupId: string }) {
  const { toggleGroupReaction } = useApp();
  const isMe = msg.userId === currentUser.id;
  const [showReactions, setShowReactions] = useState(false);
  const reactionEntries = Object.entries(msg.reactions).filter(([, u]) => u.length > 0);
  const myReactions = Object.entries(msg.reactions)
    .filter(([, u]) => u.includes(currentUser.id))
    .map(([e]) => e);
  return (
    <div className={`flex gap-2 items-end ${isMe ? "flex-row-reverse" : "flex-row"}`}>
      {" "}
      {!isMe && <UserAvatar userId={msg.userId} size="sm" />}{" "}
      <div className={`max-w-[78%] flex flex-col gap-1 ${isMe ? "items-end" : "items-start"}`}>
        {" "}
        {!isMe && (
          <span className="text-text-muted text-[10px] font-body ml-1">
            {getUserName(msg.userId).split(" ")[0]}
          </span>
        )}{" "}
        {/* Spoiler warning */}{" "}
        {msg.spoilerWarning && (
          <div className="flex items-center gap-1 text-[10px] text-accent font-body font-semibold bg-accent/10 border border-accent/30 rounded-full px-2 py-0.5">
            {" "}
            ⚠️ Spoiler ahead{" "}
          </div>
        )}{" "}
        {/* Bubble */}{" "}
        <button
          onClick={() => setShowReactions((v) => !v)}
          className={`rounded-2xl px-3.5 py-2.5 text-left ${isMe ? "bg-accent text-white rounded-br-sm" : "bg-bg-elevated text-text-primary rounded-bl-sm border border-border"}`}
          style={{ wordBreak: "break-word" }}
        >
          {" "}
          {/* Content ref tag */}{" "}
          {msg.contentRef && (
            <div
              className={`flex items-center gap-1 text-[10px] font-body font-semibold mb-1 ${isMe ? "text-white/70" : "text-accent"}`}
            >
              {" "}
              <span>{msg.contentRef.type === "movie" ? "🎬" : "📺"}</span>{" "}
              <span>{msg.contentRef.title}</span>{" "}
              {msg.contentRef.rating && (
                <RatingBadge rating={msg.contentRef.rating} size="sm" />
              )}{" "}
            </div>
          )}{" "}
          <p className="text-sm font-body leading-relaxed">{msg.text}</p>{" "}
        </button>{" "}
        {/* Reactions */}{" "}
        {reactionEntries.length > 0 && (
          <div className={`flex gap-1 flex-wrap ${isMe ? "justify-end" : "justify-start"}`}>
            {" "}
            {reactionEntries.map(([emoji, users]) => (
              <button
                key={emoji}
                onClick={() => toggleGroupReaction(groupId, msg.id, emoji, currentUser.id)}
                className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs border transition-all ${myReactions.includes(emoji) ? "bg-accent/30 border-accent/50" : "bg-bg-elevated border-border"}`}
              >
                {" "}
                <span>{emoji}</span>{" "}
                <span className="text-text-secondary text-[10px]">{users.length}</span>{" "}
              </button>
            ))}{" "}
          </div>
        )}{" "}
        {/* Reaction picker */}{" "}
        {showReactions && (
          <div
            className={`flex gap-1 bg-bg-card border border-border rounded-2xl p-2 shadow-xl animate-scaleIn z-10 ${isMe ? "flex-row-reverse" : ""}`}
          >
            {" "}
            {CHAT_REACTIONS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  toggleGroupReaction(groupId, msg.id, emoji, currentUser.id);
                  setShowReactions(false);
                }}
                className="text-lg hover:scale-125 transition-transform w-8 h-8 flex items-center justify-center"
              >
                {" "}
                {emoji}{" "}
              </button>
            ))}{" "}
          </div>
        )}{" "}
        <span className="text-text-muted text-[9px] font-body px-1">
          {timeAgo(msg.timestamp)}
        </span>{" "}
      </div>{" "}
    </div>
  );
}
function CreatePollModal({ groupId, onClose }: { groupId: string; onClose: () => void }) {
  const { sendGroupPoll } = useApp();
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const addOption = () => {
    if (options.length < 4) {
      setOptions([...options, ""]);
    }
  };
  const updateOption = (idx: number, text: string) => {
    setOptions((prev) => {
      const newOptions = [...prev];
      newOptions[idx] = text;
      return newOptions;
    });
  };
  const submit = () => {
    const nonEmptyOptions = options.filter((o) => o.trim());
    if (!question.trim() || nonEmptyOptions.length < 2) return;
    sendGroupPoll(groupId, {
      id: `poll_${Date.now()}`,
      userId: currentUser.id,
      question: question.trim(),
      options: nonEmptyOptions.map((text, idx) => ({
        id: `opt_${idx}_${Date.now()}`,
        text: text.trim(),
        votes: [],
      })),
      timestamp: new Date().toISOString(),
      closed: false,
    });
    onClose();
  };
  return (
    <div
      className="fixed inset-0 z-50 flex items-end bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      {" "}
      <div
        className="w-full max-w-app mx-auto bg-bg-secondary rounded-t-3xl p-5 pb-8 animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        {" "}
        <div className="w-10 h-1 bg-bg-elevated rounded-full mx-auto mb-5" />{" "}
        <h2 className="font-display font-bold text-text-primary text-xl mb-4">Create Poll</h2>{" "}
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question..."
          className="w-full bg-bg-card border border-border rounded-xl px-3 py-2.5 text-text-primary text-sm font-body placeholder-text-muted focus:outline-none focus:border-accent mb-4"
        />{" "}
        <p className="text-text-secondary text-xs font-body uppercase tracking-wide mb-2">
          Options
        </p>{" "}
        <div className="flex flex-col gap-2 mb-4">
          {" "}
          {options.map((option, idx) => (
            <input
              key={idx}
              type="text"
              value={option}
              onChange={(e) => updateOption(idx, e.target.value)}
              placeholder={`Option ${idx + 1}`}
              className="w-full bg-bg-card border border-border rounded-xl px-3 py-2.5 text-text-primary text-sm font-body placeholder-text-muted focus:outline-none focus:border-accent"
            />
          ))}{" "}
        </div>{" "}
        {options.length < 4 && (
          <button
            onClick={addOption}
            className="w-full py-2.5 rounded-xl border border-dashed border-accent/50 text-accent text-sm font-body font-semibold mb-4 active:scale-95 transition-all"
          >
            {" "}
            + Add Option{" "}
          </button>
        )}{" "}
        <button
          onClick={submit}
          disabled={!question.trim() || options.filter((o) => o.trim()).length < 2}
          className="w-full py-4 rounded-2xl font-display font-bold text-white text-base transition-all active:scale-95 disabled:opacity-40"
          style={{ background: "linear-gradient(135deg, #A78BFA, #7C5CF6)" }}
        >
          {" "}
          Send Poll{" "}
        </button>{" "}
      </div>{" "}
    </div>
  );
}
function ChatView({ group }: { group: GroupClub }) {
  const { sendGroupMessage } = useApp();
  const [input, setInput] = useState("");
  const [spoiler, setSpoiler] = useState(false);
  const [showPollModal, setShowPollModal] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [group.messages.length]);
  const send = () => {
    const text = input.trim();
    if (!text) return;
    sendGroupMessage(group.id, {
      id: `msg_${Date.now()}`,
      userId: currentUser.id,
      text,
      timestamp: new Date().toISOString(),
      reactions: {},
      spoilerWarning: spoiler,
    });
    setInput("");
    setSpoiler(false);
  };
  return (
    <div className="flex flex-col h-full">
      {" "}
      {/* Currently watching banner */}{" "}
      {group.currentWatch && (
        <div className="mx-4 mt-2 mb-1 bg-accent/10 border border-accent/30 rounded-xl px-3 py-2 flex items-center gap-2">
          {" "}
          <span>{group.currentWatch.type === "show" ? "📺" : "🎬"}</span>{" "}
          <div className="flex-1 min-w-0">
            {" "}
            <p className="text-accent text-xs font-body font-semibold truncate">
              {" "}
              Now watching: {group.currentWatch.title}{" "}
              {group.currentWatch.episode && ` — ${group.currentWatch.episode}`}{" "}
            </p>{" "}
          </div>{" "}
          <span className="text-text-muted text-[10px] font-body flex-shrink-0">
            Group pick
          </span>{" "}
        </div>
      )}{" "}
      {/* Messages */}{" "}
      <div className="flex-1 overflow-y-auto px-4 py-2 flex flex-col gap-3 scrollbar-hide">
        {" "}
        {group.messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-16 text-center text-text-muted">
            {" "}
            <p className="text-4xl mb-3">{group.emoji}</p>{" "}
            <p className="font-body text-sm">No messages yet.</p>{" "}
            <p className="font-body text-xs mt-1">Start the conversation!</p>{" "}
          </div>
        ) : (
          group.messages.map((msg) => <ChatBubble key={msg.id} msg={msg} groupId={group.id} />)
        )}{" "}
        <div ref={bottomRef} />{" "}
      </div>{" "}
      {/* Input */}{" "}
      <div className="px-4 py-3 bg-bg-primary border-t border-border">
        {" "}
        {spoiler && (
          <div className="flex items-center gap-2 mb-2 text-xs text-accent font-body">
            {" "}
            <span>⚠️ Spoiler warning will be added</span>{" "}
            <button onClick={() => setSpoiler(false)} className="text-text-muted">
              ✕
            </button>{" "}
          </div>
        )}{" "}
        <div className="flex items-end gap-2">
          {" "}
          <div className="flex-1 bg-bg-elevated border border-border rounded-2xl flex items-end px-3 py-2 gap-2">
            {" "}
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="Message..."
              rows={1}
              className="flex-1 bg-transparent text-text-primary text-sm font-body placeholder-text-muted resize-none outline-none max-h-24 scrollbar-hide"
              style={{ lineHeight: "1.4" }}
            />{" "}
            <button
              onClick={() => setSpoiler((v) => !v)}
              className={`text-sm flex-shrink-0 transition-colors ${spoiler ? "text-accent" : "text-text-muted"}`}
              title="Mark as spoiler"
            >
              {" "}
              ⚠️{" "}
            </button>{" "}
          </div>{" "}
          <button
            onClick={() => setShowPollModal(true)}
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all active:scale-95 text-text-muted hover:text-accent"
            title="Create poll"
          >
            {" "}
            📊{" "}
          </button>{" "}
          <button
            onClick={send}
            disabled={!input.trim()}
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all active:scale-95 disabled:opacity-40"
            style={{
              background: input.trim() ? "linear-gradient(135deg, #A78BFA, #7C5CF6)" : "#252540",
            }}
          >
            {" "}
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {" "}
              <line x1="22" y1="2" x2="11" y2="13" />{" "}
              <polygon points="22 2 15 22 11 13 2 9 22 2" />{" "}
            </svg>{" "}
          </button>{" "}
        </div>{" "}
      </div>{" "}
      {showPollModal && (
        <CreatePollModal groupId={group.id} onClose={() => setShowPollModal(false)} />
      )}{" "}
    </div>
  );
}
// ─── Predictions View ─────────────────────────────────────────────────────────
function PredictionCard({ pred, groupId }: { pred: Prediction; groupId: string }) {
  const { lockPrediction, revealPrediction, votePrediction } = useApp();
  const isMe = pred.userId === currentUser.id;
  const [revealInput, setRevealInput] = useState("");
  const [showRevealForm, setShowRevealForm] = useState(false);
  const rightVotes = Object.values(pred.votes ?? {}).filter((v) => v === "right").length;
  const wrongVotes = Object.values(pred.votes ?? {}).filter((v) => v === "wrong").length;
  const myVote = pred.votes?.[currentUser.id];
  return (
    <div
      className="bg-bg-card rounded-2xl p-4 border transition-all"
      style={{ borderColor: pred.revealed ? "#22C55E50" : pred.locked ? "#7C5CF650" : "#2A2A45" }}
    >
      {" "}
      {/* Header */}{" "}
      <div className="flex items-start gap-2 mb-3">
        {" "}
        <UserAvatar userId={pred.userId} size="sm" />{" "}
        <div className="flex-1 min-w-0">
          {" "}
          <div className="flex items-center gap-2 flex-wrap">
            {" "}
            <span className="font-display font-semibold text-text-primary text-xs">
              {" "}
              {isMe ? "You" : getUserName(pred.userId)}{" "}
            </span>{" "}
            <span className="text-text-muted text-[10px] font-body">
              on {pred.contentTitle}
            </span>{" "}
          </div>{" "}
        </div>{" "}
        {/* Status badge */}{" "}
        <span
          className="text-[10px] font-body font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
          style={
            pred.revealed
              ? { backgroundColor: "#22C55E25", color: "#22C55E" }
              : pred.locked
                ? { backgroundColor: "#7C5CF625", color: "#A78BFA" }
                : { backgroundColor: "#F5A62325", color: "#F5A623" }
          }
        >
          {" "}
          {pred.revealed ? "✓ Revealed" : pred.locked ? "🔒 Locked" : "✏️ Draft"}{" "}
        </span>{" "}
      </div>{" "}
      {/* Prediction text */}{" "}
      <p className="text-text-primary text-sm font-body leading-relaxed bg-bg-elevated rounded-xl p-3 border border-border">
        {" "}
        "{pred.text}"{" "}
      </p>{" "}
      {/* Result */}{" "}
      {pred.revealed && pred.result && (
        <div className="mt-3 bg-green-500/10 border border-green-500/30 rounded-xl p-3">
          {" "}
          <p className="text-green-400 text-xs font-body font-semibold mb-1">What happened:</p>{" "}
          <p className="text-text-primary text-sm font-body">{pred.result}</p>{" "}
        </div>
      )}{" "}
      {/* Voting (post-reveal) */}{" "}
      {pred.revealed && (
        <div className="mt-3 flex items-center gap-2">
          {" "}
          <span className="text-text-muted text-xs font-body">Was this right?</span>{" "}
          <button
            onClick={() => votePrediction(groupId, pred.id, "right")}
            className={`px-3 py-1 rounded-full text-xs font-body font-semibold border transition-all ${myVote === "right" ? "bg-green-500/20 border-green-500/50 text-green-400" : "border-border text-text-secondary"}`}
          >
            {" "}
            👍 Right {rightVotes > 0 && `(${rightVotes})`}{" "}
          </button>{" "}
          <button
            onClick={() => votePrediction(groupId, pred.id, "wrong")}
            className={`px-3 py-1 rounded-full text-xs font-body font-semibold border transition-all ${myVote === "wrong" ? "bg-red-500/20 border-red-500/50 text-red-400" : "border-border text-text-secondary"}`}
          >
            {" "}
            👎 Wrong {wrongVotes > 0 && `(${wrongVotes})`}{" "}
          </button>{" "}
        </div>
      )}{" "}
      {/* Actions */}{" "}
      {!pred.revealed && isMe && (
        <div className="flex gap-2 mt-3">
          {" "}
          {!pred.locked && (
            <button
              onClick={() => lockPrediction(groupId, pred.id)}
              className="flex-1 py-2 rounded-xl text-xs font-body font-semibold border border-accent/50 text-accent bg-accent/10 active:scale-95 transition-all"
            >
              {" "}
              🔒 Lock In{" "}
            </button>
          )}{" "}
          {pred.locked && !pred.revealed && (
            <button
              onClick={() => setShowRevealForm((v) => !v)}
              className="flex-1 py-2 rounded-xl text-xs font-body font-semibold border border-green-500/50 text-green-400 bg-green-500/10 active:scale-95 transition-all"
            >
              {" "}
              👁 Reveal Result{" "}
            </button>
          )}{" "}
        </div>
      )}{" "}
      {/* Reveal form */}{" "}
      {showRevealForm && (
        <div className="mt-3 animate-fadeIn flex gap-2">
          {" "}
          <input
            type="text"
            value={revealInput}
            onChange={(e) => setRevealInput(e.target.value)}
            placeholder="What actually happened..."
            className="flex-1 bg-bg-elevated border border-border rounded-xl px-3 py-2 text-text-primary text-xs font-body placeholder-text-muted focus:outline-none focus:border-accent"
          />{" "}
          <button
            onClick={() => {
              if (revealInput.trim()) {
                revealPrediction(groupId, pred.id, revealInput.trim());
                setShowRevealForm(false);
                setRevealInput("");
              }
            }}
            className="px-3 py-2 rounded-xl bg-green-500 text-white text-xs font-body font-semibold active:scale-95 transition-all"
          >
            {" "}
            Submit{" "}
          </button>{" "}
        </div>
      )}{" "}
      {pred.lockedAt && !pred.revealed && (
        <p className="text-text-muted text-[10px] font-body mt-2">
          Locked {timeAgo(pred.lockedAt)}
        </p>
      )}{" "}
    </div>
  );
}
function NewPredictionForm({ groupId, onDone }: { groupId: string; onDone: () => void }) {
  const { addPrediction, groups } = useApp();
  const group = groups.find((g) => g.id === groupId)!;
  const [text, setText] = useState("");
  const contentTitle = group.currentWatch?.title ?? "Current Pick";
  const submit = () => {
    if (!text.trim()) return;
    addPrediction(groupId, {
      id: `pred_${Date.now()}`,
      userId: currentUser.id,
      contentTitle,
      text: text.trim(),
      locked: false,
      revealed: false,
    });
    setText("");
    onDone();
  };
  return (
    <div className="bg-bg-card rounded-2xl p-4 border border-accent/30 animate-scaleIn">
      {" "}
      <p className="font-display font-semibold text-text-primary text-sm mb-1">
        New Prediction
      </p>{" "}
      <p className="text-text-muted text-xs font-body mb-3">About: {contentTitle}</p>{" "}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="I think..."
        rows={3}
        className="w-full bg-bg-elevated border border-border rounded-xl px-3 py-2.5 text-text-primary text-sm font-body placeholder-text-muted focus:outline-none focus:border-accent resize-none"
      />{" "}
      <div className="flex gap-2 mt-3">
        {" "}
        <button
          onClick={onDone}
          className="flex-1 py-2.5 rounded-xl border border-border text-text-secondary text-sm font-body font-semibold active:scale-95"
        >
          {" "}
          Cancel{" "}
        </button>{" "}
        <button
          onClick={submit}
          disabled={!text.trim()}
          className="flex-1 py-2.5 rounded-xl bg-accent text-white text-sm font-body font-semibold active:scale-95 disabled:opacity-40 transition-all"
        >
          {" "}
          Add Prediction{" "}
        </button>{" "}
      </div>{" "}
    </div>
  );
}
function PredictionsView({ group }: { group: GroupClub }) {
  const [showForm, setShowForm] = useState(false);
  const open = group.predictions.filter((p) => !p.revealed);
  const revealed = group.predictions.filter((p) => p.revealed);
  return (
    <div className="flex flex-col gap-4 px-4 py-3 overflow-y-auto scrollbar-hide pb-6">
      {" "}
      {/* New prediction button */}{" "}
      {!showForm && group.currentWatch && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full py-3 rounded-2xl border border-dashed border-accent/50 text-accent text-sm font-body font-semibold flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          {" "}
          🔮 Add a Prediction{" "}
        </button>
      )}{" "}
      {showForm && <NewPredictionForm groupId={group.id} onDone={() => setShowForm(false)} />}{" "}
      {open.length > 0 && (
        <>
          {" "}
          <p className="text-text-secondary text-xs font-body uppercase tracking-wide">
            Active Predictions
          </p>{" "}
          {open.map((p) => (
            <PredictionCard key={p.id} pred={p} groupId={group.id} />
          ))}{" "}
        </>
      )}{" "}
      {revealed.length > 0 && (
        <>
          {" "}
          <p className="text-text-secondary text-xs font-body uppercase tracking-wide mt-2">
            Revealed
          </p>{" "}
          {revealed.map((p) => (
            <PredictionCard key={p.id} pred={p} groupId={group.id} />
          ))}{" "}
        </>
      )}{" "}
      {group.predictions.length === 0 && !showForm && (
        <div className="py-12 text-center text-text-muted">
          {" "}
          <p className="text-3xl mb-2">🔮</p>{" "}
          <p className="font-body text-sm">No predictions yet.</p>{" "}
          <p className="font-body text-xs mt-1">Lock in your takes before watching!</p>{" "}
        </div>
      )}{" "}
    </div>
  );
}
// ─── Members View ─────────────────────────────────────────────────────────────
function MembersView({ group }: { group: GroupClub }) {
  const allUsers = [currentUser, ...friends];
  return (
    <div className="flex flex-col gap-3 px-4 py-3 overflow-y-auto scrollbar-hide pb-6">
      {" "}
      <p className="text-text-secondary text-xs font-body uppercase tracking-wide">
        {group.memberIds.length} Members
      </p>{" "}
      {group.memberIds.map((memberId) => {
        const user = allUsers.find((u) => u.id === memberId);
        if (!user) return null;
        const watching = nowWatching.find((nw) => nw.userId === memberId);
        const isOnline = watching !== undefined;
        return (
          <div
            key={memberId}
            className="bg-bg-card rounded-2xl p-3 border border-border flex items-center gap-3"
          >
            {" "}
            <div className="relative">
              {" "}
              <UserAvatar userId={memberId} size="md" />{" "}
              {isOnline && (
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-400 border-2 border-bg-primary" />
              )}{" "}
            </div>{" "}
            <div className="flex-1 min-w-0">
              {" "}
              <div className="flex items-center gap-2">
                {" "}
                <p className="font-display font-semibold text-text-primary text-sm">
                  {" "}
                  {user.id === currentUser.id ? "You" : user.name}{" "}
                </p>{" "}
                {user.id === currentUser.id && (
                  <span className="text-[10px] text-text-muted font-body border border-border rounded-full px-1.5">
                    you
                  </span>
                )}{" "}
              </div>{" "}
              <p className="text-text-muted text-xs font-body">@{user.username}</p>{" "}
              {watching && (
                <div className="flex items-center gap-1 mt-1">
                  {" "}
                  <span className="text-[10px] text-green-400 font-body font-semibold">
                    ● Watching
                  </span>{" "}
                  <span className="text-[10px] text-text-secondary font-body">
                    {watching.title}
                  </span>{" "}
                  {watching.episode && (
                    <span className="text-[10px] text-text-muted font-body">
                      {watching.episode}
                    </span>
                  )}{" "}
                </div>
              )}{" "}
            </div>{" "}
            {/* Prediction count for this member */}{" "}
            <div className="text-right flex-shrink-0">
              {" "}
              <p className="text-text-primary font-display font-bold text-sm">
                {" "}
                {group.predictions.filter((p) => p.userId === memberId).length}{" "}
              </p>{" "}
              <p className="text-text-muted text-[10px] font-body">preds</p>{" "}
            </div>{" "}
          </div>
        );
      })}{" "}
    </div>
  );
}
// ─── Group Detail ─────────────────────────────────────────────────────────────
function GroupDetail({ group, onBack }: { group: GroupClub; onBack: () => void }) {
  const [view, setView] = useState<GroupView>("chat");
  const openPreds = group.predictions.filter((p) => !p.revealed && !p.locked).length;
  return (
    <div className="flex flex-col h-screen bg-bg-primary">
      {" "}
      {/* Header */}{" "}
      <div className="bg-bg-primary/95 backdrop-blur-md px-4 pt-6 pb-0 flex-shrink-0">
        {" "}
        <div className="flex items-center gap-3 mb-3">
          {" "}
          <button
            onClick={onBack}
            className="w-8 h-8 rounded-full bg-bg-card border border-border flex items-center justify-center active:scale-95"
          >
            {" "}
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>{" "}
          </button>{" "}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {" "}
            <span className="text-2xl">{group.emoji}</span>{" "}
            <div className="min-w-0">
              {" "}
              <p className="font-display font-bold text-text-primary text-base truncate">
                {group.name}
              </p>{" "}
              {group.currentWatch && (
                <p className="text-accent text-xs font-body truncate">
                  {" "}
                  {group.currentWatch.type === "show" ? "📺" : "🎬"} {group.currentWatch.title}{" "}
                  {group.currentWatch.episode && ` · ${group.currentWatch.episode}`}{" "}
                </p>
              )}{" "}
            </div>{" "}
          </div>{" "}
          {/* Member stack */}{" "}
          <div className="flex -space-x-2 flex-shrink-0">
            {" "}
            {group.memberIds.slice(0, 3).map((id) => (
              <div
                key={id}
                className="w-7 h-7 rounded-full border-2 border-bg-primary flex items-center justify-center text-[10px] font-bold text-white"
                style={{
                  backgroundColor:
                    AVATAR_COLORS[parseInt(id.replace(/\D/g, "")) % AVATAR_COLORS.length],
                }}
              >
                {" "}
                {getInitial(getUserName(id))}{" "}
              </div>
            ))}{" "}
          </div>{" "}
        </div>{" "}
        {/* Sub-nav */}{" "}
        <div className="flex bg-bg-card rounded-xl p-1 gap-1">
          {" "}
          {[
            { id: "chat" as GroupView, label: "Chat" },
            {
              id: "predictions" as GroupView,
              label: `Predictions${openPreds > 0 ? ` · ${openPreds}` : ""}`,
            },
            { id: "members" as GroupView, label: "Members" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setView(tab.id)}
              className={`flex-1 py-2 rounded-lg text-xs font-body font-semibold transition-all ${view === tab.id ? "bg-accent text-white shadow-sm" : "text-text-secondary"}`}
            >
              {" "}
              {tab.label}{" "}
            </button>
          ))}{" "}
        </div>{" "}
      </div>{" "}
      {/* Content (flex-1 so chat fills remaining space) */}{" "}
      <div className="flex-1 overflow-hidden flex flex-col">
        {" "}
        {view === "chat" && <ChatView group={group} />}{" "}
        {view === "predictions" && <PredictionsView group={group} />}{" "}
        {view === "members" && <MembersView group={group} />}{" "}
      </div>{" "}
    </div>
  );
}
// ─── Friends Watching Modal ───────────────────────────────────────────────────
function FriendsWatchingModal({ onClose }: { onClose: () => void }) {
  const { pushScreen } = useApp();
  const friendsWithActivity = friends.map((friend) => {
    const watching = nowWatching.find((nw) => nw.userId === friend.id);
    const lastActivity = feedActivities
      .filter((activity) => activity.user?.id === friend.id || activity.userId === friend.id)
      .sort((a, b) => new Date(b.timestamp ?? b.createdAt ?? 0).getTime() - new Date(a.timestamp ?? a.createdAt ?? 0).getTime())[0];
    return { friend, watching, lastActivity };
  });
  const activeFriends = friendsWithActivity.filter((f) => f.watching);
  const handleNavigateToProfile = (userId: string) => {
    pushScreen({ screen: "profile", userId });
    onClose();
  };
  return (
    <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-app z-[100] flex flex-col bg-bg-primary h-screen">
      {" "}
      {/* Header */}{" "}
      <div className="bg-bg-primary/95 backdrop-blur-md px-4 pt-6 pb-3 flex-shrink-0">
        {" "}
        <div className="flex items-center gap-3 mb-3">
          {" "}
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-bg-card border border-border flex items-center justify-center active:scale-95"
          >
            {" "}
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>{" "}
          </button>{" "}
          <h2 className="font-display font-bold text-text-primary text-xl flex-1">
            Friends Watching Now
          </h2>{" "}
        </div>{" "}
      </div>{" "}
      {/* Content */}{" "}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-3 pb-6">
        {" "}
        {activeFriends.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-text-muted">
            {" "}
            <p className="text-4xl mb-3">👀</p>{" "}
            <p className="font-body text-sm">No friends watching right now.</p>{" "}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {" "}
            {activeFriends.map(({ friend, watching, lastActivity }) => (
              <button
                key={friend.id}
                onClick={() => handleNavigateToProfile(friend.id)}
                className="bg-bg-card rounded-2xl p-4 border border-border text-left active:scale-[0.98] transition-all"
              >
                {" "}
                {/* Friend header */}{" "}
                <div className="flex items-start gap-3 mb-3">
                  {" "}
                  <div className="relative">
                    {" "}
                    <UserAvatar userId={friend.id} size="md" />{" "}
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-green-400 border-2 border-bg-card" />{" "}
                  </div>{" "}
                  <div className="flex-1 min-w-0">
                    {" "}
                    <p className="font-display font-semibold text-text-primary text-sm">
                      {friend.name}
                    </p>{" "}
                    <p className="text-text-muted text-xs font-body">@{friend.username}</p>{" "}
                  </div>{" "}
                </div>{" "}
                {/* Currently watching */}{" "}
                {watching && (
                  <div className="bg-bg-elevated border border-border rounded-xl p-3 mb-2">
                    {" "}
                    <p className="text-text-muted text-[10px] font-body uppercase tracking-wide mb-1">
                      Currently watching
                    </p>{" "}
                    <p className="text-accent text-sm font-body font-semibold">
                      {" "}
                      {watching.title} {watching.episode && ` · ${watching.episode}`}{" "}
                    </p>{" "}
                  </div>
                )}{" "}
                {/* Last watched */}{" "}
                {lastActivity && (
                  <div className="bg-bg-elevated border border-border rounded-xl p-3">
                    {" "}
                    <p className="text-text-muted text-[10px] font-body uppercase tracking-wide mb-1">
                      Last watched
                    </p>{" "}
                    <div className="flex items-center gap-2">
                      {" "}
                      <p className="text-text-primary text-sm font-body">
                        {lastActivity.movie?.title ?? lastActivity.show?.title ?? "Unknown"}
                      </p>{" "}
                      {lastActivity.rating && (
                        <RatingBadge rating={lastActivity.rating} size="sm" />
                      )}{" "}
                    </div>{" "}
                  </div>
                )}{" "}
                {!watching && !lastActivity && (
                  <p className="text-text-muted text-sm font-body">
                    Not watching anything right now
                  </p>
                )}{" "}
              </button>
            ))}{" "}
          </div>
        )}{" "}
      </div>{" "}
    </div>
  );
}
// ─── Create Group Modal ───────────────────────────────────────────────────────
const EMOJI_OPTIONS = ["🎬", "📺", "🎭", "🩸", "🔥", "👻", "🌙", "🎪", "🍿", "🎥", "🕵️", "🦁"];
function CreateGroupModal({ onClose }: { onClose: () => void }) {
  const { createGroup } = useApp();
  const [step, setStep] = useState<"type" | "details">("type");
  const [clubType, setClubType] = useState<"group-watch" | "friends-club" | null>(null);
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🎬");
  const [desc, setDesc] = useState("");
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const toggleFriend = (id: string) => {
    setSelectedFriends((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id],
    );
  };
  const submit = () => {
    if (!name.trim() || selectedFriends.length === 0 || !clubType) return;
    createGroup({
      id: `group_${Date.now()}`,
      name: name.trim(),
      emoji,
      description: desc.trim() || undefined,
      memberIds: [currentUser.id, ...selectedFriends],
      messages: [],
      predictions: [],
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      clubType,
    });
    onClose();
  };
  if (step === "type") {
    return (
      <div
        className="fixed inset-0 z-50 flex items-end bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        {" "}
        <div
          className="w-full max-w-app mx-auto bg-bg-secondary rounded-t-3xl p-5 pb-8 animate-fadeIn"
          onClick={(e) => e.stopPropagation()}
        >
          {" "}
          <div className="w-10 h-1 bg-bg-elevated rounded-full mx-auto mb-5" />{" "}
          <h2 className="font-display font-bold text-text-primary text-xl mb-4">
            What kind of club?
          </h2>{" "}
          <div className="flex flex-col gap-3 mb-6">
            {" "}
            {/* Group Watch */}{" "}
            <button
              onClick={() => {
                setClubType("group-watch");
                setStep("details");
              }}
              className={`p-4 rounded-2xl border-2 transition-all text-left ${clubType === "group-watch" ? "border-accent bg-accent/10" : "border-border bg-bg-card"}`}
            >
              {" "}
              <p className="font-display font-semibold text-text-primary text-base mb-1">
                🎬 Group Watch
              </p>{" "}
              <p className="text-text-secondary text-sm font-body">
                Everyone watching the same show or movie together
              </p>{" "}
            </button>{" "}
            {/* Friends Club */}{" "}
            <button
              onClick={() => {
                setClubType("friends-club");
                setStep("details");
              }}
              className={`p-4 rounded-2xl border-2 transition-all text-left ${clubType === "friends-club" ? "border-accent bg-accent/10" : "border-border bg-bg-card"}`}
            >
              {" "}
              <p className="font-display font-semibold text-text-primary text-base mb-1">
                👥 Friends Club
              </p>{" "}
              <p className="text-text-secondary text-sm font-body">
                Keep up with what your friends are watching
              </p>{" "}
            </button>{" "}
          </div>{" "}
          <button
            onClick={onClose}
            className="w-full py-4 rounded-2xl font-display font-bold text-text-secondary text-base border border-border transition-all active:scale-95"
          >
            {" "}
            Cancel{" "}
          </button>{" "}
        </div>{" "}
      </div>
    );
  }
  return (
    <div
      className="fixed inset-0 z-50 flex items-end bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      {" "}
      <div
        className="w-full max-w-app mx-auto bg-bg-secondary rounded-t-3xl p-5 pb-8 animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        {" "}
        <div className="w-10 h-1 bg-bg-elevated rounded-full mx-auto mb-5" />{" "}
        <div className="flex items-center gap-3 mb-4">
          {" "}
          <button
            onClick={() => setStep("type")}
            className="w-8 h-8 rounded-full bg-bg-card border border-border flex items-center justify-center active:scale-95"
          >
            {" "}
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>{" "}
          </button>{" "}
          <h2 className="font-display font-bold text-text-primary text-xl flex-1">New Club</h2>{" "}
        </div>{" "}
        {/* Emoji picker */}{" "}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-3 pb-1">
          {" "}
          {EMOJI_OPTIONS.map((e) => (
            <button
              key={e}
              onClick={() => setEmoji(e)}
              className={`w-10 h-10 rounded-xl text-xl flex-shrink-0 flex items-center justify-center transition-all ${emoji === e ? "bg-accent/30 border-2 border-accent" : "bg-bg-elevated border border-border"}`}
            >
              {" "}
              {e}{" "}
            </button>
          ))}{" "}
        </div>{" "}
        {/* Name */}{" "}
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Club name..."
          className="w-full bg-bg-card border border-border rounded-xl px-3 py-2.5 text-text-primary text-sm font-body placeholder-text-muted focus:outline-none focus:border-accent mb-3"
        />{" "}
        <input
          type="text"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="Description (optional)..."
          className="w-full bg-bg-card border border-border rounded-xl px-3 py-2.5 text-text-primary text-sm font-body placeholder-text-muted focus:outline-none focus:border-accent mb-3"
        />{" "}
        {/* Friends */}{" "}
        <p className="text-text-secondary text-xs font-body uppercase tracking-wide mb-2">
          Add Friends
        </p>{" "}
        <div className="flex flex-col gap-2 mb-5">
          {" "}
          {friends.map((f) => {
            const selected = selectedFriends.includes(f.id);
            return (
              <button
                key={f.id}
                onClick={() => toggleFriend(f.id)}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${selected ? "border-accent bg-accent/10" : "border-border bg-bg-card"}`}
              >
                {" "}
                <UserAvatar userId={f.id} size="sm" />{" "}
                <p className="font-body text-sm text-text-primary flex-1 text-left">{f.name}</p>{" "}
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${selected ? "border-accent bg-accent" : "border-border"}`}
                >
                  {" "}
                  {selected && (
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth={3}
                      strokeLinecap="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}{" "}
                </div>{" "}
              </button>
            );
          })}{" "}
        </div>{" "}
        <button
          onClick={submit}
          disabled={!name.trim() || selectedFriends.length === 0}
          className="w-full py-4 rounded-2xl font-display font-bold text-white text-base transition-all active:scale-95 disabled:opacity-40"
          style={{ background: "linear-gradient(135deg, #A78BFA, #7C5CF6)" }}
        >
          {" "}
          Create Club{" "}
        </button>{" "}
      </div>{" "}
    </div>
  );
}
// ─── Main GroupsTab ───────────────────────────────────────────────────────────
export default function GroupsTab() {
  const { groups } = useApp();
  const [activeGroup, setActiveGroup] = useState<GroupClub | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showFriendsWatching, setShowFriendsWatching] = useState(false); // Get currently watching across all friends
  const allWatching = nowWatching;
  if (activeGroup) {
    const live = groups.find((g) => g.id === activeGroup.id) ?? activeGroup;
    return <GroupDetail group={live} onBack={() => setActiveGroup(null)} />;
  }
  if (showFriendsWatching) {
    return <FriendsWatchingModal onClose={() => setShowFriendsWatching(false)} />;
  }
  return (
    <div className="min-h-screen bg-bg-primary">
      {" "}
      {/* Header */}{" "}
      <div className="sticky top-0 z-10 bg-bg-primary/95 backdrop-blur-md px-4 pt-6 pb-3">
        {" "}
        <div className="flex items-center justify-between">
          {" "}
          <h1 className="font-display font-bold text-2xl text-text-primary">Clubs</h1>{" "}
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-accent text-white text-sm font-body font-semibold active:scale-95 transition-all"
          >
            {" "}
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth={2.5}
              strokeLinecap="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>{" "}
            New Club{" "}
          </button>{" "}
        </div>{" "}
      </div>{" "}
      <div className="px-4 pb-6 space-y-4">
        {" "}
        {/* Friends Watching Button Card */}{" "}
        {allWatching.length > 0 && (
          <button
            onClick={() => setShowFriendsWatching(true)}
            className="w-full bg-bg-card rounded-2xl p-4 border border-border flex items-center justify-between active:scale-[0.98] transition-all"
          >
            {" "}
            <div className="flex items-center gap-2">
              {" "}
              <span className="text-lg">👁</span>{" "}
              <span className="font-display font-semibold text-text-primary">
                Friends Watching Now
              </span>{" "}
            </div>{" "}
            <div className="flex items-center gap-2 text-text-secondary">
              {" "}
              <span className="text-sm font-body">{allWatching.length} live</span>{" "}
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
              >
                <polyline points="9 6 15 12 9 18" />
              </svg>{" "}
            </div>{" "}
          </button>
        )}{" "}
        {/* Groups list */}{" "}
        <div>
          {" "}
          <p className="text-text-secondary text-xs font-body uppercase tracking-wide mb-2">
            {" "}
            Your Clubs ({groups.length}){" "}
          </p>{" "}
          {groups.length === 0 ? (
            <div className="bg-bg-card rounded-2xl p-8 border border-border text-center text-text-muted">
              {" "}
              <p className="text-4xl mb-3">🎬</p> <p className="font-body text-sm">No clubs yet.</p>{" "}
              <p className="font-body text-xs mt-1">
                Create one to watch and predict together!
              </p>{" "}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {" "}
              {[...groups]
                .sort(
                  (a, b) => new Date(b.lastActivity ?? 0).getTime() - new Date(a.lastActivity ?? 0).getTime(),
                )
                .map((group) => (
                  <GroupListCard
                    key={group.id}
                    group={group}
                    onOpen={() => setActiveGroup(group)}
                  />
                ))}{" "}
            </div>
          )}{" "}
        </div>{" "}
      </div>{" "}
      {showCreate && <CreateGroupModal onClose={() => setShowCreate(false)} />}{" "}
    </div>
  );
}
