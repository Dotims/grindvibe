import { motion } from "framer-motion";
import type { ExerciseDto } from "../../api/exercises";
import { pickGifUrl, ACCENT } from "../../lib/routinesMeta";

export default function ExerciseTile({ item, onAdd }: { item: ExerciseDto; onAdd: (e: ExerciseDto) => void }) {
  const body = item.bodyPart || item.primaryMuscles?.[0] || (item.secondaryMuscles?.[0] ?? "Exercise");
  const initials = item.name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  const gif = pickGifUrl(item);

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onAdd(item)}
      className="group w-full text-left cursor-pointer rounded-2xl border border-border/50
                 bg-[color-mix(in_oklab,var(--gv-bg)_88%,#fff_12%)]
                 hover:bg-[color-mix(in_oklab,var(--gv-bg)_80%,#fff_20%)]
                 transition shadow-[0_8px_28px_-14px_rgba(0,0,0,0.45)] p-3"
      aria-label={`Add ${item.name}`}
    >
      <div className="flex items-center gap-3">
        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[color-mix(in_oklab,var(--gv-bg)_75%,#fff_25%)] grid place-items-center">
          {gif ? (
            <img src={gif} alt={item.name} className="h-full w-full object-cover" loading="lazy" decoding="async" />
          ) : (
            <span className="text-xs font-semibold opacity-80">{initials}</span>
          )}
        </div>
        <div className="min-w-0">
          <div className="font-semibold leading-tight line-clamp-2">{item.name}</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">{body}</div>
        </div>
      </div>
      <div className="mt-2 text-[12px] font-medium" style={{ color: ACCENT }}>
        Kliknij, aby dodać
      </div>
    </motion.button>
  );
}
