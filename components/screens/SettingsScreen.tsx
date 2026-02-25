"use client";
import { useState } from "react";
import { useApp } from "@/lib/AppContext";

// ─── Icons ────────────────────────────────────────────────────────────────────

const I = {
  user: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  mail: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  phone: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3-8.59A2 2 0 0 1 3.59 1.5h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9a16 16 0 0 0 6.91 6.91l.81-.81a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
  lock: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  film: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/></svg>,
  share: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>,
  bell: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  eye: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  eyeOff: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>,
  star: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  message: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  shield: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  moon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
  globe: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  trash: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
  logOut: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  info: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
};

// ─── Toggle ───────────────────────────────────────────────────────────────────

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="relative w-11 h-6 rounded-full transition-colors flex-shrink-0"
      style={{ backgroundColor: value ? "#7C5CF6" : "var(--bg-elevated)" }}
      aria-checked={value}
      role="switch"
    >
      <span
        className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform"
        style={{ transform: value ? "translateX(20px)" : "translateX(0)" }}
      />
    </button>
  );
}

// ─── Row components ───────────────────────────────────────────────────────────

function SettingRow({
  icon,
  label,
  sublabel,
  onPress,
  danger = false,
}: {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  onPress?: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onPress}
      className="w-full flex items-center gap-3.5 px-4 py-3.5 active:bg-bg-elevated transition-colors text-left"
    >
      <span className={`flex-shrink-0 ${danger ? "text-red-400" : "text-text-muted"}`}>
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-body font-medium ${
            danger ? "text-red-400" : "text-text-primary"
          }`}
        >
          {label}
        </p>
        {sublabel && <p className="text-xs text-text-muted font-body mt-0.5">{sublabel}</p>}
      </div>
      {!danger && (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          className="text-text-muted"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      )}
    </button>
  );
}

function ToggleRow({
  icon,
  label,
  sublabel,
  value,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-3.5 px-4 py-3.5">
      <span className="flex-shrink-0 text-text-muted">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-body font-medium text-text-primary">{label}</p>
        {sublabel && <p className="text-xs text-text-muted font-body mt-0.5">{sublabel}</p>}
      </div>
      <Toggle value={value} onChange={onChange} />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-body font-semibold uppercase tracking-widest text-text-muted px-4 mb-1 mt-6">
        {title}
      </p>
      <div className="bg-bg-card border-y border-border divide-y divide-border">{children}</div>
    </div>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function SettingsScreen() {
  const { popScreen, theme, toggleTheme, logout, currentUserData, pushScreen } = useApp();

  const [notifFriendRates, setNotifFriendRates] = useState(true);
  const [notifRecommend, setNotifRecommend] = useState(true);
  const [notifNewFollower, setNotifNewFollower] = useState(true);
  const [notifWeeklyDigest, setNotifWeeklyDigest] = useState(false);
  const [privateProfile, setPrivateProfile] = useState(false);
  const [showWatching, setShowWatching] = useState(true);
  const [showRatingsState, setShowRatingsState] = useState(true);
  const [allowRecommend, setAllowRecommend] = useState(true);
  const [autoPlay, setAutoPlay] = useState(false);
  const [haptics, setHaptics] = useState(true);
  const [confirmLogout, setConfirmLogout] = useState(false);

  const handleLogout = () => {
    if (confirmLogout) {
      logout();
      popScreen();
    } else {
      setConfirmLogout(true);
      setTimeout(() => setConfirmLogout(false), 3000);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto scrollbar-hide bg-bg-primary">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-bg-primary/95 backdrop-blur-md border-b border-border px-4 py-3 flex items-center gap-3">
        <button
          onClick={popScreen}
          className="w-8 h-8 rounded-full bg-bg-card border border-border flex items-center justify-center active:scale-95 transition-all"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 className="font-display font-bold text-lg text-text-primary flex-1">Settings</h1>
      </div>

      <div className="pb-24">
        <Section title="Account">
          <SettingRow
            icon={I.user}
            label="Edit Profile"
            sublabel={`@${currentUserData.username}`}
            onPress={() => { popScreen(); pushScreen({ screen: "profile-edit" }); }}
          />
          <SettingRow icon={I.mail} label="Email Address" sublabel="gavin@example.com" onPress={() => {}} />
          <SettingRow icon={I.phone} label="Phone Number" sublabel="Not set" onPress={() => {}} />
          <SettingRow icon={I.lock} label="Change Password" onPress={() => {}} />
        </Section>

        <Section title="Notifications">
          <ToggleRow
            icon={I.film}
            label="Friend rates something"
            sublabel="When a friend logs a new rating"
            value={notifFriendRates}
            onChange={setNotifFriendRates}
          />
          <ToggleRow
            icon={I.share}
            label="Recommendations"
            sublabel="When a friend sends you a pick"
            value={notifRecommend}
            onChange={setNotifRecommend}
          />
          <ToggleRow
            icon={I.user}
            label="New followers"
            sublabel="When someone follows you"
            value={notifNewFollower}
            onChange={setNotifNewFollower}
          />
          <ToggleRow
            icon={I.bell}
            label="Weekly digest"
            sublabel="A summary of activity each week"
            value={notifWeeklyDigest}
            onChange={setNotifWeeklyDigest}
          />
        </Section>

        <Section title="Privacy">
          <ToggleRow
            icon={I.eyeOff}
            label="Private profile"
            sublabel="Only approved followers see your lists"
            value={privateProfile}
            onChange={setPrivateProfile}
          />
          <ToggleRow
            icon={I.eye}
            label="Show watching status"
            sublabel="Let friends see what you're watching"
            value={showWatching}
            onChange={setShowWatching}
          />
          <ToggleRow
            icon={I.star}
            label="Show your ratings"
            sublabel="Visible to friends by default"
            value={showRatingsState}
            onChange={setShowRatingsState}
          />
          <ToggleRow
            icon={I.message}
            label="Allow recommendations"
            sublabel="Friends can send you picks"
            value={allowRecommend}
            onChange={setAllowRecommend}
          />
          <SettingRow icon={I.shield} label="Blocked accounts" sublabel="Manage who you've blocked" onPress={() => {}} />
        </Section>

        <Section title="Preferences">
          <ToggleRow
            icon={I.moon}
            label="Dark mode"
            sublabel={theme === "dark" ? "Currently on" : "Currently off"}
            value={theme === "dark"}
            onChange={() => toggleTheme()}
          />
          <ToggleRow
            icon={I.film}
            label="Haptic feedback"
            sublabel="Vibrate on interactions"
            value={haptics}
            onChange={setHaptics}
          />
          <ToggleRow
            icon={I.globe}
            label="Autoplay trailers"
            sublabel="Play previews automatically"
            value={autoPlay}
            onChange={setAutoPlay}
          />
          <SettingRow icon={I.globe} label="Language" sublabel="English" onPress={() => {}} />
        </Section>

        <Section title="Data">
          <SettingRow icon={I.film} label="Export your data" onPress={() => {}} />
          <SettingRow icon={I.info} label="Privacy Policy" onPress={() => {}} />
          <SettingRow icon={I.info} label="Terms of Service" onPress={() => {}} />
        </Section>

        <Section title="Danger Zone">
          <SettingRow
            icon={I.logOut}
            label={confirmLogout ? "Tap again to confirm" : "Log Out"}
            danger
            onPress={handleLogout}
          />
          <SettingRow icon={I.trash} label="Delete Account" danger onPress={() => {}} />
        </Section>

        <p className="text-center text-text-muted text-xs font-body mt-8 pb-4">
          Binge v1.0.0 · Made with 🎬
        </p>
      </div>
    </div>
  );
}
