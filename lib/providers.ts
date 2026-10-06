// Streaming services. Ids match TMDB's watch-provider ids so live data lines up.
export interface Provider {
  id: number;
  key: string;
  name: string;
  short: string; // 1–3 chars for the small logo chip
  color: string;
  textColor?: string;
}

export const PROVIDERS: Record<string, Provider> = {
  netflix: { id: 8, key: "netflix", name: "Netflix", short: "N", color: "#E50914" },
  max: { id: 1899, key: "max", name: "Max", short: "max", color: "#002BE7" },
  hulu: { id: 15, key: "hulu", name: "Hulu", short: "hulu", color: "#1CE783", textColor: "#0B0C0F" },
  disney: { id: 337, key: "disney", name: "Disney+", short: "D+", color: "#113CCF" },
  apple: { id: 350, key: "apple", name: "Apple TV+", short: "tv+", color: "#E8E4DC", textColor: "#0D0D12" },
  prime: { id: 9, key: "prime", name: "Prime Video", short: "prime", color: "#00A8E1" },
  peacock: { id: 386, key: "peacock", name: "Peacock", short: "P", color: "#F2B705", textColor: "#0D0D12" },
  paramount: { id: 531, key: "paramount", name: "Paramount+", short: "P+", color: "#0064FF" },
  amc: { id: 526, key: "amc", name: "AMC+", short: "amc", color: "#1A1A1A" },
};

export const PROVIDER_LIST: Provider[] = Object.values(PROVIDERS);

const BY_TMDB_ID = new Map<number, Provider>(PROVIDER_LIST.map((p) => [p.id, p]));
// TMDB still returns the old HBO Max id for some titles.
BY_TMDB_ID.set(384, PROVIDERS.max);

export function providerFromTmdb(id: number, name: string): Provider {
  return (
    BY_TMDB_ID.get(id) ?? {
      id,
      key: `tmdb-${id}`,
      name,
      short: name.slice(0, 3),
      color: "#252533",
    }
  );
}

export function providersFor(keys: string[] | undefined): Provider[] {
  return (keys ?? []).map((k) => PROVIDERS[k]).filter(Boolean);
}
