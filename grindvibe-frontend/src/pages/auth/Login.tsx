import { Link, useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { motion } from "framer-motion";
import { LogIn, Mail, Lock, Eye, EyeOff, HelpCircle } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../auth/useAuth";
// import { GoogleLogin } from "@react-oauth/google";
import { useGoogleLogin } from "@react-oauth/google";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state as { from?: {pathname: string} } | null;
  const from =  state?.from?.pathname || "/account";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch (err: unknown) {
      let message = "Coś poszło nie tak. Spróbuj ponownie.";
      if (err instanceof Error) message = err.message;
      setError(message);
    } finally {
      setIsLoading(false);  
    }
  }

    const loginWithGoogle = useGoogleLogin({
      flow: "auth-code",
      onSuccess: async (resp) => {
        const authCode = resp.code; 
        console.log("Google auth code:", authCode);

        try {
          const res = await fetch("https://localhost:7093/auth/google", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ AuthCode: authCode }),
          });

          if (!res.ok) {
            const errorData = await res.json();
            console.error("Google login failed:", errorData);
            setError(`Logowanie przez Google nie powiodło się: ${errorData.message || 'Nieznany błąd'}`);
            return;
          }

          const data = await res.json();
          localStorage.setItem("token", data.token);
          localStorage.setItem("auth_user", JSON.stringify(data.user));
          navigate("/account");
        } catch (err) {
          console.error("Google login failed:", err);
          setError("Logowanie przez Google nie powiodło się.");
        }
      },
      onError: () => {
        setError("Google login failed");
      },
    });


  return (
    <section
      className="
        relative min-h-[85vh] w-full overflow-hidden
        bg-[radial-gradient(1200px_420px_at_10%_-20%,var(--gv-accent)/10_0,transparent_60%),radial-gradient(1200px_420px_at_110%_120%,var(--gv-accent)/10_0,transparent_60%)]
        dark:bg-[radial-gradient(1200px_420px_at_10%_-20%,var(--gv-accent)/18_0,transparent_60%),radial-gradient(1200px_420px_at_110%_120%,var(--gv-accent)/18_0,transparent_60%)]
      "
    >
      {/* Siatka tła (subtelna) */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-30 bg-[linear-gradient(to_right,rgba(0,0,0,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.06)_1px,transparent_1px)] bg-[size:36px_36px] opacity-[0.16] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] dark:opacity-[0.12]"
      />

      {/* Orby akcentowe — bez fade-in na starcie (fix ghost shadow) */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-20"
        initial={false}
      >
        <motion.div
          className="absolute -top-24 -left-24 h-[28rem] w-[28rem]
                     rounded-full bg-[var(--gv-accent)]/12 blur-3xl
                     dark:bg-[var(--gv-accent)]/18
                     transform-gpu will-change-transform will-change-opacity
                     [backface-visibility:hidden]"
          animate={{ y: [0, 10, -6, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-24 -right-24 h-[28rem] w-[28rem]
                     rounded-full bg-[var(--gv-accent)]/12 blur-3xl
                     dark:bg-[var(--gv-accent)]/18
                     transform-gpu will-change-transform will-change-opacity
                     [backface-visibility:hidden]"
          animate={{ y: [0, -8, 6, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1.1 }}
        />
      </motion.div>

      {/* Centrum */}
      <div className="mx-auto flex min-h-[85vh] w-full max-w-6xl items-center justify-center px-6 py-12 md:py-16">
        <div className="w-full max-w-md">
          {/* Gradient border + glass (izolacja warstwy + stabilne tło) */}
          <div className="isolate rounded-2xl bg-gradient-to-b from-white/70 via-white/55 to-white/40 p-[1px] shadow-[0_8px_50px_-12px_rgba(0,0,0,0.35)] backdrop-blur-xl dark:from-zinc-800/55 dark:via-zinc-800/45 dark:to-zinc-900/40 dark:shadow-[0_8px_50px_-12px_rgba(0,0,0,0.7)]">
            <div className="rounded-2xl border border-white/40 bg-white/80 dark:border-white/10 dark:bg-zinc-900/70">
              <Card className="rounded-2xl border-0 bg-transparent shadow-none">
                <CardContent className="p-6 sm:p-8">
                  {/* Nagłówek */}
                  <div className="mb-6 text-center">
                    <h2 className="text-2xl font-bold tracking-tight">Zaloguj się</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Użyj e-maila i hasła lub Google.
                    </p>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={loginWithGoogle}
                    disabled={isLoading}
                    className="mb-5 inline-flex h-11 w-full cursor-pointer items-center justify-center gap-3 rounded-xl border-border/70 bg-background/60 backdrop-blur-md"
                  >
                    <GoogleIcon className="h-5 w-5" />
                    Kontynuuj z Google
                  </Button>

                  {/* Divider */}
                  <div className="relative mb-5">
                    <div className="absolute inset-0 flex items-center">
                      <span className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="rounded-full bg-background px-3 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                        lub e-mail
                      </span>
                    </div>
                  </div>

                  {/* Formularz */}
                  <form onSubmit={onSubmit} className="grid gap-5">
                    {/* Email */}
                    <div className="grid gap-2">
                      <Label htmlFor="email">E-mail</Label>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="kowalski@example.com"
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

                    {/* Hasło */}
                    <div className="grid gap-2">
                      <Label htmlFor="password">Hasło</Label>
                      <div className="relative">
                        <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          required
                          autoComplete="current-password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="
                            pl-10 pr-10
                            focus-visible:ring-[var(--gv-accent)]
                            focus-visible:ring-2
                            focus-visible:ring-offset-2
                            dark:focus-visible:ring-offset-zinc-900
                          "
                        />
                        <button
                          type="button"
                          aria-label={showPassword ? "Ukryj hasło" : "Pokaż hasło"}
                          onClick={() => setShowPassword((s) => !s)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1.5 text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gv-accent)]"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground">Minimum 8 znaków.</p>
                    </div>

                    {/* Remember me + Zapomniałem hasło */}
                    <div className="flex items-center justify-between text-sm">
                      <label className="inline-flex select-none items-center gap-2">
                        <input
                          type="checkbox"
                          name="remember"
                          className="h-4 w-4 cursor-pointer rounded border border-border text-[color:var(--gv-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gv-accent)]"
                        />
                        <span>Pamiętaj mnie</span>
                      </label>

                      <Link
                        to="/auth/forgot-password"
                        className="
                          inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1
                          text-xs text-[var(--gv-accent)] transition
                          hover:underline hover:bg-[var(--gv-accent)]/5
                          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gv-accent)] focus-visible:ring-offset-2
                          dark:focus-visible:ring-offset-zinc-900
                        "
                      >
                        <HelpCircle size={14} />
                        Zapomniałem hasło
                      </Link>
                    </div>

                    {/* Error */}
                    {error && (
                      <p role="status" aria-live="polite" className="text-sm text-red-600 dark:text-red-400">
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
                      <LogIn size={18} />
                      {isLoading ? "Logowanie…" : "Zaloguj się"}
                    </Button>

                    <p className="text-center text-sm text-muted-foreground">
                      Nie masz konta?{" "}
                      <Link to="/auth/register" className="text-[var(--gv-accent)] underline-offset-4 hover:underline">
                        Zarejestruj się
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

/** Lokalna ikona Google (SVG) – bez zewnętrznych zależności */
function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 533.5 544.3" aria-hidden="true" {...props}>
      <path fill="#4285F4" d="M533.5 278.4c0-17.4-1.6-34.1-4.6-50.2H272v95h147.1c-6.3 33.7-25.2 62.2-53.8 81.3v67h86.9c50.8-46.8 81.3-115.7 81.3-193.1z"/>
      <path fill="#34A853" d="M272 544.3c72.9 0 134.2-24.1 178.9-65.5l-86.9-67c-24.1 16.2-55 25.7-92 25.7-70.6 0-130.4-47.6-151.8-111.5h-90.1v69.9c44.7 88.7 136.7 148.4 242 148.4z"/>
      <path fill="#FBBC05" d="M120.2 326c-10.6-31.7-10.6-65.9 0-97.6v-70h-90.1C-21.5 215.7-21.5 328.6 30.1 415.3l90.1-69.3z"/>
      <path fill="#EA4335" d="M272 107.7c39.6-.6 77.6 13.9 106.7 40.5l80-80C409.8 25 345.8.1 272 0 166.7 0 74.7 59.7 30.1 148.4l90.1 69.9C141.6 154.4 201.4 107.7 272 107.7z"/>
    </svg>
  );
}
