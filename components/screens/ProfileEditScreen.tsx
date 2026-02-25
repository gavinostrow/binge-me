"use client";
import { useApp } from "@/lib/AppContext";
import { genres } from "@/lib/mockData";
import { useState } from "react";
export default function ProfileEditScreen() {
  const { popScreen, currentUserData, updateProfile } = useApp();
  const [name, setName] = useState(currentUserData.name);
  const [username, setUsername] = useState(currentUserData.username);
  const [bio, setBio] = useState(currentUserData.bio || "");
  const [selectedGenres, setSelectedGenres] = useState<string[]>(
    currentUserData.favoriteGenres || [],
  );
  const [avatarBase64, setAvatarBase64] = useState<string>("");
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre],
    );
  };
  const handleSave = () => {
    updateProfile({
      name,
      username,
      bio,
      favoriteGenres: selectedGenres,
      ...(avatarBase64 && { avatarUrl: avatarBase64 }),
    });
    popScreen();
  };
  return (
    <div className="flex flex-col h-full overflow-y-auto scrollbar-hide bg-bg-primary">
      {" "}
      <div className="sticky top-0 z-10 bg-bg-primary/95 backdrop-blur-sm border-b border-border px-4 py-3 flex items-center justify-between">
        {" "}
        <button onClick={popScreen} className="text-text-primary text-xl">
          {" "}
          ←{" "}
        </button>{" "}
        <h2 className="font-display text-lg text-text-primary font-semibold">
          Edit Profile
        </h2>{" "}
        <div className="w-6" />{" "}
      </div>{" "}
      <div className="px-4 pb-8 pt-4 space-y-6">
        {" "}
        <div className="space-y-2">
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
        <div className="space-y-2">
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
        <div className="space-y-2">
          {" "}
          <label className="block text-text-secondary text-sm font-semibold">
            Bio
          </label>{" "}
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full bg-bg-card border border-border rounded-xl px-4 py-3 text-text-primary placeholder-text-muted focus:outline-none focus:border-accent min-h-[100px]"
            placeholder="Tell us about yourself..."
          />{" "}
        </div>{" "}
        <div className="space-y-2">
          {" "}
          <label className="block text-text-secondary text-sm font-semibold">
            Profile Picture
          </label>{" "}
          <input
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="w-full bg-bg-card border border-border rounded-xl px-4 py-3 text-text-primary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-accent file:text-white hover:file:bg-accent-light"
          />{" "}
        </div>{" "}
        <div className="space-y-3">
          {" "}
          <label className="block text-text-secondary text-sm font-semibold">
            Favorite Genres
          </label>{" "}
          <div className="grid grid-cols-2 gap-2">
            {" "}
            {genres.map((genre) => (
              <button
                key={genre}
                onClick={() => toggleGenre(genre)}
                className={`px-3 py-2 rounded-lg text-sm font-body transition ${selectedGenres.includes(genre) ? "bg-accent text-white" : "bg-bg-card text-text-secondary hover:bg-bg-elevated"}`}
              >
                {" "}
                {genre}{" "}
              </button>
            ))}{" "}
          </div>{" "}
        </div>{" "}
        <div className="space-y-2 pt-4">
          {" "}
          <button
            onClick={handleSave}
            className="w-full py-3 bg-gradient-to-r from-accent to-accent-light text-white font-display font-bold rounded-2xl"
          >
            {" "}
            Save Changes{" "}
          </button>{" "}
          <button
            onClick={popScreen}
            className="w-full py-3 bg-bg-card text-text-primary font-body font-semibold rounded-2xl hover:bg-bg-elevated transition"
          >
            {" "}
            Cancel{" "}
          </button>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
}
