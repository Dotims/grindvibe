import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { useAuth } from "../../auth/useAuth";
import { LogOut, Mail, User as UserIcon, Image as ImageIcon } from "lucide-react";
import type { AuthUser } from "../../auth/types";
import { useAppDispatch } from "../../store/hooks";
import { setUser as setAuthUser } from "../../features/auth/authSlice";

const API_BASE = import.meta.env.VITE_API_URL ?? "";

async function uploadAvatar(file: File, token: string): Promise<{ user: AuthUser }> {
  const form = new FormData();
  form.append("file", file);

  const url = `${API_BASE.replace(/\/+$/, "")}/users/me/avatar`;
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} – ${text || "Upload failed"}`);
  }

  const data = (await res.json()) as { user: AuthUser };
  return data;
}

function getInitials(nickname?: string | null, email?: string | null) {
  const base = (nickname && nickname.trim()) || (email && email.split("@")[0]) || "";
  if (!base) return "GV";
  const parts = base.trim().split(/[\s._-]+/).filter(Boolean);
  const first = parts[0]?.[0]?.toUpperCase() ?? "";
  const second = parts[1]?.[0]?.toUpperCase() ?? "";
  return (first + second) || first || "GV";
}

function getUserGradient(
  u?: { email?: string | null; nickname?: string | null } | null
): string {
  const seed = u?.email || u?.nickname || "grindvibe";
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  const hue1 = Math.abs(hash) % 360;
  const hue2 = (hue1 + 40) % 360;
  return `linear-gradient(135deg, hsl(${hue1},70%,55%) 0%, hsl(${hue2},70%,55%) 100%)`;
}

export default function Account() {
  const { user, token, setUser, logout, loading } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const dispatch = useAppDispatch();

  if (loading) {
    return (
      <main className="min-h-[85vh] grid place-items-center">
        <div className="animate-pulse text-sm text-muted-foreground">Ładowanie konta…</div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-[85vh] grid place-items-center">
        <p className="text-sm text-muted-foreground">Brak danych użytkownika.</p>
      </main>
    );
  }

  const initials = getInitials(user.nickname, user.email);

  return (
    <section
      className="
        relative min-h-[85vh] w-full overflow-hidden
        bg-[radial-gradient(1200px_420px_at_10%_-20%,var(--gv-accent)/10_0,transparent_60%),radial-gradient(1200px_420px_at_110%_120%,var(--gv-accent)/10_0,transparent_60%)]
        dark:bg-[radial-gradient(1200px_420px_at_10%_-20%,var(--gv-accent)/18_0,transparent_60%),radial-gradient(1200px_420px_at_110%_120%,var(--gv-accent)/18_0,transparent_60%)]
      "
    >
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-30 bg-[linear-gradient(to_right,rgba(0,0,0,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.06)_1px,transparent_1px)] bg-[size:36px_36px] opacity-[0.16] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] dark:opacity-[0.12]"
      />

      <motion.div aria-hidden className="pointer-events-none fixed inset-0 -z-20" initial={false}>
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

      <div className="mx-auto flex min-h-[85vh] w-full max-w-5xl items-center justify-center px-6 py-12 md:py-16">
        <div className="w-full max-w-3xl">
          <div className="isolate rounded-2xl bg-gradient-to-b from-white/70 via-white/55 to-white/40 p-[1px] shadow-[0_8px_50px_-12px_rgba(0,0,0,0.35)] backdrop-blur-xl dark:from-zinc-800/55 dark:via-zinc-800/45 dark:to-zinc-900/40 dark:shadow-[0_8px_50px_-12px_rgba(0,0,0,0.7)]">
            <div className="rounded-2xl border border-white/40 bg-white/70 supports-[backdrop-filter]:bg-white/60 backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/60">
              <Card className="rounded-2xl border-0 bg-transparent shadow-none">
                <CardContent className="p-6 sm:p-8">
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <h1 className="text-2xl font-bold tracking-tight">Twoje konto</h1>
                      <p className="mt-1 text-sm text-muted-foreground">Dane profilu używane w GrindVibe.</p>
                    </div>

                    <Button
                      type="button"
                      onClick={logout}
                      className="cursor-pointer rounded-xl bg-[var(--gv-accent)] text-white shadow-lg shadow-[var(--gv-accent)]/25 hover:brightness-105"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Wyloguj
                    </Button>
                  </div>

                  <div className="grid gap-6 md:grid-cols-[220px_1fr]">
                    <div className="flex flex-col items-center gap-3">
                      <div className="relative aspect-square w-40 overflow-hidden rounded-[25px] shadow-md">
                        {user.avatarUrl ? (
                          <img
                            src={user.avatarUrl}
                            alt={user.nickname ?? user.email ?? "avatar"}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div
                            className="absolute inset-0 flex items-center justify-center select-none text-white text-5xl font-bold"
                            style={{ background: getUserGradient(user) }}
                          >
                            {initials}
                          </div>
                        )}
                      </div>

                      <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const f = e.target.files?.[0];
                          if (!f || !token) return;
                          try {
                            setIsUploading(true);
                            const { user: updated } = await uploadAvatar(f, token);
                            setUser(updated);               
                            dispatch(setAuthUser(updated)); 
                          } catch (err) {
                            alert((err as Error).message);
                            console.error(err);
                          } finally {
                            setIsUploading(false);
                            if (fileRef.current) fileRef.current.value = "";
                          }
                        }}
                      />

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileRef.current?.click()}
                        disabled={isUploading}
                        className="
                          cursor-pointer rounded-xl border-[var(--gv-border)]
                          bg-background/60 backdrop-blur
                          hover:bg-white/70 dark:hover:bg-zinc-800/60
                          focus-visible:ring-2 focus-visible:ring-[var(--gv-accent)] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-900
                        "
                      >
                        <ImageIcon className="mr-2 h-4 w-4" />
                        {isUploading ? "Wgrywanie…" : "Ustaw zdjęcie profilowe"}
                      </Button>
                    </div>

                    <div className="grid gap-4">
                      <div className="rounded-xl border border-white/40 bg-white/60 p-4 dark:border-white/10 dark:bg-zinc-800/60">
                        <div className="mb-1 flex items-center gap-2 text-sm font-medium">
                          <UserIcon className="h-4 w-4" />
                          Nickname
                        </div>
                        <div className="text-base">
                          {user.nickname ?? <span className="text-muted-foreground">—</span>}
                        </div>
                      </div>

                      <div className="rounded-xl border border-white/40 bg-white/60 p-4 dark:border-white/10 dark:bg-zinc-800/60">
                        <div className="mb-1 flex items-center gap-2 text-sm font-medium">
                          <Mail className="h-4 w-4" />
                          E-mail
                        </div>
                        <div className="text-base">{user.email}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
