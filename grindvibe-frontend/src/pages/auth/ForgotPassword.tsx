import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { motion } from "framer-motion";
import { Mail, SendHorizonal } from "lucide-react";

export default function ForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null);
    setError(null);
    setIsLoading(true);

    // TODO: wywołanie backendu C# (POST /api/auth/forgot)
    setTimeout(() => {
      setIsLoading(false);
      setMsg("Jeśli podany e-mail istnieje w naszym systemie, wysłaliśmy link do resetu hasła.");
    }, 700);
  }

  return (
    <section
      className="
        relative min-h-[85vh] w-full overflow-hidden
        bg-[radial-gradient(1200px_420px_at_10%_-20%,var(--gv-accent)/10_0,transparent_60%),radial-gradient(1200px_420px_at_110%_120%,var(--gv-accent)/10_0,transparent_60%)]
        dark:bg-[radial-gradient(1200px_420px_at_10%_-20%,var(--gv-accent)/18_0,transparent_60%),radial-gradient(1200px_420px_at_110%_120%,var(--gv-accent)/18_0,transparent_60%)]
      "
    >
      {/* Siatka tła */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(to_right,rgba(0,0,0,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.06)_1px,transparent_1px)] bg-[size:36px_36px] opacity-[0.16] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] dark:opacity-[0.12]"
      />

      {/* Orby */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          className="absolute -top-24 -left-24 h-[28rem] w-[28rem] rounded-full bg-[var(--gv-accent)]/12 blur-3xl dark:bg-[var(--gv-accent)]/18"
          animate={{ y: [0, 10, -6, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-24 -right-24 h-[28rem] w-[28rem] rounded-full bg-[var(--gv-accent)]/12 blur-3xl dark:bg-[var(--gv-accent)]/18"
          animate={{ y: [0, -8, 6, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1.1 }}
        />
      </motion.div>

      {/* Centrum */}
      <div className="mx-auto flex min-h-[85vh] w-full max-w-6xl items-center justify-center px-6 py-12 md:py-16">
        <div className="w-full max-w-md">
          {/* Gradient border + glass */}
          <div className="rounded-2xl bg-gradient-to-b from-white/70 via-white/55 to-white/40 p-[1px] shadow-[0_8px_50px_-12px_rgba(0,0,0,0.35)] backdrop-blur-xl dark:from-zinc-800/55 dark:via-zinc-800/45 dark:to-zinc-900/40 dark:shadow-[0_8px_50px_-12px_rgba(0,0,0,0.7)]">
            <div className="rounded-2xl border border-white/40 bg-white/65 backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/50">
              <Card className="rounded-2xl border-0 bg-transparent shadow-none">
                <CardContent className="p-6 sm:p-8">
                  {/* Nagłówek */}
                  <div className="mb-6 text-center">
                    <h1 className="text-2xl font-bold tracking-tight">Reset hasła</h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Podaj swój adres e-mail. Wyślemy link do zmiany hasła.
                    </p>
                  </div>

                  {/* Formularz */}
                  <form onSubmit={onSubmit} className="grid gap-5">
                    <div className="grid gap-2">
                      <Label htmlFor="email">Adres e-mail</Label>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="you@example.com"
                          required
                          autoComplete="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="
                            pl-10
                            focus-visible:ring-[var(--gv-accent)]
                            focus-visible:ring-2
                            focus-visible:ring-offset-2
                            dark:focus-visible:ring-offset-zinc-900
                          "
                        />
                      </div>
                    </div>

                    {/* Komunikaty */}
                    {msg && (
                      <p role="status" className="text-sm text-foreground/80">
                        {msg}
                      </p>
                    )}
                    {error && (
                      <p role="alert" className="text-sm text-red-600 dark:text-red-400">
                        {error}
                      </p>
                    )}

                    {/* Submit */}
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="
                        h-11 w-full cursor-pointer gap-2 rounded-xl
                        bg-[var(--gv-accent)] text-white
                        shadow-lg shadow-[var(--gv-accent)]/25
                        transition hover:brightness-105 active:scale-[0.99]
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--gv-accent)]
                        dark:focus-visible:ring-offset-zinc-900
                      "
                    >
                      <SendHorizonal size={18} />
                      {isLoading ? "Wysyłanie…" : "Wyślij link resetujący"}
                    </Button>

                    <p className="text-center text-sm text-muted-foreground">
                      Pamiętasz hasło?{" "}
                      <Link to="/auth/login" className="text-[var(--gv-accent)] underline-offset-4 hover:underline">
                        Zaloguj się
                      </Link>
                    </p>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
