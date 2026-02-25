"use client";
import { useApp } from "@/lib/AppContext";
import { useState } from "react";
export default function AuthScreen() {
  const { popScreen, login, signup } = useApp();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const handleSignIn = async () => {
    setLoading(true);
    try {
      await login(email, password);
      popScreen();
    } finally {
      setLoading(false);
    }
  };
  const handleSignUp = async () => {
    setLoading(true);
    try {
      await signup(name, username, email, password);
      popScreen();
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex flex-col h-full overflow-y-auto scrollbar-hide bg-bg-primary">
      {" "}
      <div className="sticky top-0 z-10 bg-bg-primary/95 backdrop-blur-sm border-b border-border px-4 py-3">
        {" "}
        <button onClick={popScreen} className="text-text-primary text-xl">
          {" "}
          ←{" "}
        </button>{" "}
      </div>{" "}
      <div className="flex-1 px-4 py-8 flex flex-col justify-center">
        {" "}
        <div className="space-y-2 text-center mb-8">
          {" "}
          <h1 className="font-display text-4xl font-bold text-text-primary">
            binge
          </h1>{" "}
          <p className="text-text-secondary">
            Rate movies and shows with friends
          </p>{" "}
        </div>{" "}
        <div className="flex gap-2 mb-8">
          {" "}
          <button
            onClick={() => setMode("signin")}
            className={`flex-1 py-2 rounded-lg font-body font-semibold transition ${mode === "signin" ? "bg-accent text-white" : "bg-bg-card text-text-secondary hover:bg-bg-elevated"}`}
          >
            {" "}
            Sign In{" "}
          </button>{" "}
          <button
            onClick={() => setMode("signup")}
            className={`flex-1 py-2 rounded-lg font-body font-semibold transition ${mode === "signup" ? "bg-accent text-white" : "bg-bg-card text-text-secondary hover:bg-bg-elevated"}`}
          >
            {" "}
            Sign Up{" "}
          </button>{" "}
        </div>{" "}
        <div className="space-y-4">
          {" "}
          {mode === "signup" && (
            <>
              {" "}
              <div className="space-y-1">
                {" "}
                <label className="block text-text-secondary text-sm font-semibold">
                  Name
                </label>{" "}
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-bg-card border border-border rounded-xl px-4 py-3 text-text-primary placeholder-text-muted focus:outline-none focus:border-accent"
                  placeholder="Your name"
                />{" "}
              </div>{" "}
              <div className="space-y-1">
                {" "}
                <label className="block text-text-secondary text-sm font-semibold">
                  Username
                </label>{" "}
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-bg-card border border-border rounded-xl px-4 py-3 text-text-primary placeholder-text-muted focus:outline-none focus:border-accent"
                  placeholder="@username"
                />{" "}
              </div>{" "}
            </>
          )}{" "}
          <div className="space-y-1">
            {" "}
            <label className="block text-text-secondary text-sm font-semibold">
              Email
            </label>{" "}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-bg-card border border-border rounded-xl px-4 py-3 text-text-primary placeholder-text-muted focus:outline-none focus:border-accent"
              placeholder="you@example.com"
            />{" "}
          </div>{" "}
          <div className="space-y-1">
            {" "}
            <label className="block text-text-secondary text-sm font-semibold">
              Password
            </label>{" "}
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-bg-card border border-border rounded-xl px-4 py-3 text-text-primary placeholder-text-muted focus:outline-none focus:border-accent"
              placeholder="••••••••"
            />{" "}
          </div>{" "}
          <button
            onClick={mode === "signin" ? handleSignIn : handleSignUp}
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-accent to-accent-light text-white font-display font-bold rounded-2xl disabled:opacity-50 transition"
          >
            {" "}
            {loading
              ? "Loading..."
              : mode === "signin"
                ? "Sign In"
                : "Create Account"}{" "}
          </button>{" "}
        </div>{" "}
        <p className="text-text-secondary text-sm text-center mt-6">
          {" "}
          {mode === "signin"
            ? "Don't have an account? "
            : "Already have an account? "}{" "}
          <button
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setEmail("");
              setPassword("");
              setName("");
              setUsername("");
            }}
            className="text-accent font-semibold hover:text-accent-light"
          >
            {" "}
            {mode === "signin" ? "Sign up" : "Sign in"}{" "}
          </button>{" "}
        </p>{" "}
      </div>{" "}
    </div>
  );
}
