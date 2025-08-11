import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import type { Variants, TargetAndTransition } from "framer-motion";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: (custom: number = 0): TargetAndTransition => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay: custom * 0.08,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

export default function Hero() {
  return (
    <section className="relative z-0 isolate overflow-visible w-full">
      {/* gradienty w tle */}
      <div className="pointer-events-none fixed -top-24 right-[-10%] h-[28rem] w-[28rem] -z-10 rounded-full bg-[var(--gv-accent)]/10 blur-3xl dark:bg-[var(--gv-accent)]/15" />
      <div className="pointer-events-none absolute -bottom-24 left-[-10%] h-[28rem] w-[28rem] -z-10 rounded-full bg-[var(--gv-accent)]/10 blur-3xl dark:bg-[var(--gv-accent)]/15" />

      {/* tło sekcji */}
      <div className="absolute inset-0 -z-20 bg-gradient-to-b from-transparent via-[var(--gv-bg-soft)] to-[var(--gv-bg)]" />

      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 py-16 md:grid-cols-2 md:py-24">
        {/* LEWA: tekst */}
        <div className="text-center md:text-left space-y-6">
          <motion.h1
            className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight"
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={0}
          >
            Zbuduj formę z{" "}
            <span className="text-[var(--gv-accent)]">GrindVibe</span>
          </motion.h1>

          <motion.p
            className="text-base md:text-lg text-[var(--gv-text-soft)]"
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={1}
          >
            Plany treningowe, ćwiczenia i progres — w jednym, lekkim interfejsie.
            Minimalny szum, maksymalny fokus na trening.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start"
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={2}
          >
            <Button size="lg" className="bg-[var(--gv-accent)] hover:brightness-95 group" asChild>
              <Link to="/plan">
                Zbuduj plan
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/cwiczenia">Przegląd ćwiczeń</Link>
            </Button>
          </motion.div>

          <motion.div
            className="mt-4 flex items-center justify-center md:justify-start gap-6 text-sm text-[var(--gv-text-soft)]"
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={3}
          >
            <div>🏋️ 150+ ćwiczeń</div>
            <div>📈 trackowanie serii</div>
            <div>👥 społeczność</div>
          </motion.div>
        </div>

        {/* PRAWA: karta z animacją */}
        <motion.div
          className="flex justify-center md:justify-end"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.2 } }}
        >
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            whileHover={{
              rotateX: -6,
              rotateY: 8,
              scale: 1.02,
              transition: { type: "spring", stiffness: 220, damping: 16 },
            }}
            className="group relative w-[320px] h-[320px] md:w-[460px] md:h-[460px] rounded-3xl border border-[var(--gv-border)] bg-[var(--gv-bg-soft)] shadow-xl overflow-hidden will-change-transform"
            style={{ transformStyle: "preserve-3d", perspective: 1000 }}
          >
            <img
              src="/src/assets/hero-image.png"
              alt="Podgląd GrindVibe"
              className="h-full w-full object-cover"
            />

            {/* SHEEN */}
            <motion.div
              className="pointer-events-none absolute inset-0"
              initial={false}
              whileHover={{
                background:
                  "linear-gradient(75deg, transparent 30%, rgba(255,255,255,0.08) 50%, transparent 70%)",
                backgroundPosition: ["-200% 0%", "200% 0%"],
              }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
              style={{ backgroundSize: "200% 100%" }}
            />
            {/* górna listwa szkło */}
            <div className="absolute left-1/2 top-4 w-[80%] -translate-x-1/2 rounded-2xl bg-white/25 p-[1px] backdrop-blur-md dark:bg-white/10" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
