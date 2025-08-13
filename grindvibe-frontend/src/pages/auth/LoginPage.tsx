import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { motion } from "framer-motion";
import { LogIn, Mail, Lock } from "lucide-react";
import { useState } from "react";

export default function LoginPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // TODO: POST /api/auth/login (backend C#), zapisz token i nawiguj
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigate("/account");
    }, 600);
  }

  return (
    <section className="relative min-h-[100dvh] w-full overflow-hidden ">
      {/* tło w stylu Twojej appki */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-24 -left-24 h-[28rem] w-[28rem] rounded-full bg-[var(--gv-accent)]/10 blur-3xl dark:bg-[var(--gv-accent)]/15" />
        <div className="absolute -bottom-24 -right-24 h-[28rem] w-[28rem] rounded-full bg-[var(--gv-accent)]/10 blur-3xl dark:bg-[var(--gv-accent)]/15" />
      </div>

      <div className="mx-auto flex max-w-md flex-col items-center px-6 py-16 sm:px-8">
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-6 text-center text-3xl font-bold tracking-tight text-foreground"
        >
          Zaloguj się do <span className="text-[var(--gv-accent)]">Grind</span>Vibe
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.5 }}
          className="mb-8 text-center text-sm text-muted-foreground"
        >
          Wpisz e-mail i hasło, aby przejść do panelu konta.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.45 }}
          className="w-full"
        >
          <Card className="rounded-2xl border border-border/60 shadow-sm">
            <CardContent className="p-6 sm:p-8">
              <form onSubmit={onSubmit} className="grid gap-5">
                <div className="grid gap-2">
                  <Label htmlFor="email">E-mail</Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" size={18} />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      required
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="password">Hasło</Label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" size={18} />
                    <Input id="password" name="password" type="password" required className="pl-10" />
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="inline-flex items-center gap-2 select-none">
                    <input type="checkbox" name="remember" className="h-4 w-4 rounded border" />
                    <span>Pamiętaj mnie</span>
                  </label>
                  <Link to="/auth/forgot" className="text-[var(--gv-accent)] hover:underline">
                    Zapomniałeś hasła?
                  </Link>
                </div>

                <Button type="submit" disabled={isLoading} className="h-11 gap-2 rounded-xl">
                  <LogIn size={18} />
                  {isLoading ? "Logowanie…" : "Zaloguj się"}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Nie masz konta?{" "}
                  <Link to="/auth/register" className="text-[var(--gv-accent)] hover:underline">
                    Zarejestruj się
                  </Link>
                </p>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
