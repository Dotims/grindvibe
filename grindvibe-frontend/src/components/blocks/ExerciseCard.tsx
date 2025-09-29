import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { type ExerciseDto } from "../../api/exercises";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { parseExerciseSteps } from "../../lib/utils";

function thumbGradient(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  const h1 = Math.abs(hash) % 360;
  const h2 = (h1 + 50) % 360;
  return `linear-gradient(135deg, hsl(${h1},75%,70%), hsl(${h2},75%,70%))`;
}

type Props = {
  exercise: ExerciseDto;
  to?: string;
  onClick?: () => void;
};

export default function ExerciseCard({ exercise, to, onClick }: Props) {
  const primary = exercise.primaryMuscles ?? [];
  const secondary = exercise.secondaryMuscles ?? [];
  const equipment = exercise.equipment ?? [];
  const steps = parseExerciseSteps(exercise.description ?? null);
  const MAX_STEPS_PREVIEW = 4;

  const bodyPartLabel: string | null =
    exercise.bodyPart?.trim() ??
    (exercise.bodyPart?.trim() ?? null) ??
    (primary.find((s) => !!s && s.trim().length > 0)?.trim() ?? null);

  const [fitMode, setFitMode] = useState<"cover" | "contain">("cover");

  const decideFit = (img: HTMLImageElement) => {
    const { naturalWidth: w, naturalHeight: h } = img;
    if (!w || !h) return;
    const ratio = h / w;
    setFitMode(ratio > 1.25 ? "contain" : "cover");
  };

  const hasImage = !!exercise.imageUrl;

  const initials = useMemo(
    () =>
      exercise.name
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase(),
    [exercise.name]
  );

  return (
    <motion.div
      initial={{ y: 0, opacity: 0.98 }}
      whileHover={{ y: -3, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 350, damping: 24, mass: 0.6 }}
      className="relative bg-[var(--gv-bg)] text-[var(--gv-text)]"
    >
      {(to || onClick) && (
        onClick ? (
          <button
            type="button"
            onClick={onClick}
            aria-label={`Otwórz podgląd: ${exercise.name}`}
            className="absolute inset-0 z-10 rounded-3xl outline-none focus:outline-none focus:ring-0"
          />
        ) : (
          <Link
            to={to!}
            aria-label={`Przejdź do szczegółów: ${exercise.name}`}
            className="absolute inset-0 z-10 rounded-3xl outline-none focus:outline-none focus:ring-0"
          />
        )
      )}


      <Card className="relative overflow-hidden rounded-3xl border-0 bg-gradient-to-b
                      from-[color:var(--gv-bg)] to-[color:color-mix(in_oklab,var(--gv-bg)_90%,#000_10%)]
                      shadow-[0_10px_30px_-12px_rgba(0,0,0,0.25)] dark:shadow-[0_10px_30px_-12px_rgba(0,0,0,0.6)]">
        <CardContent className="p-0">
          <div
            className={[
              "relative w-full overflow-hidden",
              "aspect-[4/3] sm:aspect-[16/10] md:aspect-[16/9]",
              "bg-[color-mix(in_oklab,var(--gv-bg)_96%,#000_4%)]",
            ].join(" ")}
          >
            {hasImage ? (
              <img
                src={exercise.imageUrl}
                alt={exercise.name}
                loading="lazy"
                decoding="async"
                fetchPriority="low"
                onLoad={(e) => decideFit(e.currentTarget)}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                  const fallback = e.currentTarget.nextElementSibling as HTMLDivElement | null;
                  if (fallback) fallback.style.display = "grid";
                }}
                className={[
                  "absolute inset-0 h-full w-full transition-[transform,filter] duration-300 object-contain bg-[#fff]",
                  fitMode === "cover" ? "object-contain" : "object-contain p-2", 
                  "will-change-transform",
                ].join(" ")}
              />
            ) : null}

            <div
              className="absolute inset-0 hidden place-items-center text-xl font-semibold text-white"
              style={{ background: thumbGradient(exercise.name) }}
            >
              {initials}
            </div>
          </div>

          <div className="p-4">
            <div className="mb-2 flex items-center gap-2">
              {bodyPartLabel && (
                <span className="inline-flex items-center rounded-full bg-[color(display-p3_0.95_0.98_0.90)] px-2.5 py-1 text-[11px] font-medium text-[color(display-p3_0.18_0.55_0.25)]">
                  {bodyPartLabel}
                </span>
              )}
              {equipment[0] && (
                <span className="inline-flex items-center rounded-full bg-[color(display-p3_0.96_0.96_1)] px-2.5 py-1 text-[11px] font-medium text-[color(display-p3_0.30_0.38_0.75)]">
                  {equipment[0]}
                </span>
              )}
            </div>

            <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug tracking-tight">
              {exercise.name}
            </h3>

            {steps.length > 0 ? (
              <div
                className="mt-2 overflow-hidden"
                style={{
                  maxHeight: "60px",
                  WebkitMaskImage: "linear-gradient(to bottom, black 75%, transparent)",
                  maskImage: "linear-gradient(to bottom, black 75%, transparent)"
                }}
              >
                <ol className="list-decimal list-inside space-y-1 text-[13px] text-muted-foreground/90">
                  {steps.slice(0, MAX_STEPS_PREVIEW).map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ol>
              </div>
            ) : (
              exercise.description && (
                <p className="mt-1 line-clamp-3 text-[13px] text-muted-foreground/90">
                  {exercise.description}
                </p>
              )
            )}

            <div className="mt-3 flex flex-wrap gap-1.5">
              {primary.slice(0, 3).map((m) => (
                <span
                  key={m}
                  className="rounded-full bg-[color(display-p3_0.97_0.98_1)] px-2.5 py-0.5 text-[11px] text-[color(display-p3_0.25_0.35_0.70)]"
                >
                  {m}
                </span>
              ))}
              {secondary.slice(0, 2).map((m) => (
                <span
                  key={m}
                  className="rounded-full bg-transparent px-2.5 py-0.5 text-[11px] text-foreground/70 ring-1 ring-foreground/10"
                >
                  {m}
                </span>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                className="pointer-events-none select-none rounded-full border-0 bg-[color(display-p3_0.98_0.99_1)] text-[12px] font-semibold text-[color(display-p3_0.25_0.35_0.70)] shadow-[0_1px_0_0_rgba(0,0,0,0.04)]"
              >
                Szczegóły
              </Button>
              <span className="text-[11px] text-muted-foreground/70">Kliknij kartę</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
