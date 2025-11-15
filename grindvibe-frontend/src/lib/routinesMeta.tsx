export type SetType = "normal" | "warmup" | "dropset";

export type SetRow = {
  weight: number | null;
  repsMin: number | null;
  repsMax: number | null;
  rpe?: number | null;
  restSeconds?: number | null;
};

export type NotesMeta = { type: SetType; sets: SetRow[]; thumb?: string | null };

const toNum = (v: unknown): number | null =>
  typeof v === "number"
    ? v
    : typeof v === "string" && v.trim() !== "" && !Number.isNaN(Number(v))
    ? Number(v)
    : null;

const normalizeSet = (s: unknown): SetRow => {
  const o = typeof s === "object" && s !== null ? (s as Record<string, unknown>) : {};
  return {
    weight: toNum(o.weight),
    repsMin: toNum(o.repsMin ?? o.reps),
    repsMax: toNum(o.repsMax ?? o.reps),
    rpe: toNum(o.rpe),
    restSeconds: toNum(o.restSeconds),
  };
};

export function parseMeta(notes?: string | null): NotesMeta {
  if (!notes) return { type: "normal", thumb: null, sets: [normalizeSet({})] };
  try {
    const raw = JSON.parse(notes) as unknown;
    if (typeof raw !== "object" || raw === null) return { type: "normal", thumb: null, sets: [normalizeSet({})] };
    const obj = raw as Record<string, unknown>;
    const t = obj.type;
    const type: SetType = t === "warmup" || t === "dropset" || t === "normal" ? t : "normal";
    const thumb = typeof obj.thumb === "string" && obj.thumb.length > 0 ? obj.thumb : null;
    const setsUnknown = obj.sets as unknown;
    const sets: SetRow[] = Array.isArray(setsUnknown) && setsUnknown.length > 0 ? setsUnknown.map(normalizeSet) : [normalizeSet({})];
    return { type, thumb, sets };
  } catch {
    return { type: "normal", thumb: null, sets: [normalizeSet({})] };
  }
}

export function writeMeta(meta: NotesMeta): string {
  return JSON.stringify(meta);
}

// Prefer GIF if available
export function pickGifUrl(x: { imageUrl?: string; videoUrl?: string | null }): string | null {
  const cands = [x.videoUrl ?? "", x.imageUrl ?? ""].filter(Boolean);
  for (const u of cands) if (u.toLowerCase().endsWith(".gif")) return u;
  return cands[0] || null;
}

export const ACCENT = "#dc2626";
