import { Link, NavLink } from "react-router-dom";
import { Button } from "../ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "../ui/navigation-menu";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "../ui/sheet";
import { Separator } from "../ui/separator";
import { Menu, Dumbbell, User } from "lucide-react";
import ModeToggle from "../blocks/mode-toggle";
import { cn } from "../../lib/utils";
import { useAuth } from "../../auth/useAuth";

const NAV = [
  { to: "/", label: "Strona główna" },
  { to: "/plan", label: "Plan treningowy" },
  { to: "/cwiczenia", label: "Ćwiczenia" },
];

function initialsFrom(
  user?: { nickname?: string | null; email?: string | null } | null
): string {
  const base =
    (user?.nickname && user.nickname.trim()) ||
    (user?.email?.split("@")[0] ?? "");

  if (!base) return "GV";
  const parts = base.split(/[\s._-]+/).filter(Boolean);
  const a = parts[0]?.[0]?.toUpperCase() ?? "";
  const b = parts[1]?.[0]?.toUpperCase() ?? "";
  return (a + b) || a || "GV";
}

function getUserGradient(
  user?: { email?: string | null; nickname?: string | null } | null
): string {
  // Baza: email lub nickname → seed
  const seed = user?.email || user?.nickname || "default";

  // Prosty hash na liczbę
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }

  // 2 kolory na podstawie hash
  const hue1 = Math.abs(hash) % 360;
  const hue2 = (hue1 + 40) % 360;

  return `linear-gradient(135deg, hsl(${hue1}, 70%, 55%) 0%, hsl(${hue2}, 70%, 55%) 100%)`;
}


export default function Header() {
  const { isAuthenticated, user } = useAuth();

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b",
        "border-[var(--gv-border)]",
        "bg-[rgb(var(--gv-header-bg)/0.72)] backdrop-blur-md supports-[backdrop-filter]:bg-[rgb(var(--gv-header-bg)/0.58)]"
      )}>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        {/* Brand */}
        <Link
          to="/"
          className="group inline-flex items-center gap-2 cursor-pointer">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--gv-accent)] text-white">
            <Dumbbell size={18} />
          </div>
          <span className="text-lg font-bold tracking-tight">
            Grind<span className="text-[var(--gv-accent)]">Vibe</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:block">
          <NavigationMenu>
            <NavigationMenuList>
              {NAV.map((item) => (
                <NavigationMenuItem key={item.to}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      cn(
                        // typografia mocniejsza
                        "px-3 py-2 text-[15px] font-semibold tracking-wide cursor-pointer",
                        "text-[var(--gv-text-soft)] hover:text-[var(--gv-text)]",
                        "transition-colors",
                        isActive && "text-[var(--gv-accent)]"
                      )
                    }>
                    <NavigationMenuLink asChild>
                      <span>{item.label}</span>
                    </NavigationMenuLink>
                  </NavLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </nav>

        {/* Right */}
        <div className="hidden items-center gap-2 md:flex">
          {isAuthenticated ? (
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="gap-2 cursor-pointer"
            >
              <Link to="/account" className="flex items-center gap-2">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-[7px] text-sm font-bold text-white shadow-md"
                  style={{
                    background: getUserGradient(user),
                  }}
                >
                  {initialsFrom(user)}
                </div>
                <span className="font-medium">{user?.nickname ?? "Profil"}</span>
              </Link>
            </Button>
          ) : (
            <Button variant="ghost" size="sm" asChild className="gap-2 cursor-pointer">
              <Link to="/auth/login">
                <User className="h-4 w-4" />
                <span className="font-medium">Zaloguj się</span>
              </Link>
            </Button>
          )}

          
          <ModeToggle />
        </div>

        {/* Mobile */}
        <div className="flex items-center gap-2 md:hidden">
          <ModeToggle />
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="border-[var(--gv-border)] cursor-pointer">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Otwórz menu</span>
              </Button>
            </SheetTrigger>

            <SheetContent
              side="right"
              className={cn(
                "z-[70] w-[88vw] sm:w-96 p-0 bg-[#0B0B0F] text-white",
                // animacje (wymagają tailwindcss-animate)
                "data-[state=open]:animate-in data-[state=closed]:animate-out",
                "data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right",
                "duration-300",
                // ukryj ewentualny domyślny X jeśli Twój ui/sheet go ma
                "[&>button[aria-label='Close']]:hidden"
              )}>
              {/* Pasek tytułu + nasz X */}
              <div className="relative flex h-16 items-center px-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--gv-accent)]">
                    <Dumbbell size={18} />
                  </div>
                  <span className="text-lg font-bold tracking-tight">
                    Grind<span className="text-[var(--gv-accent)]">Vibe</span>
                  </span>
                </div>

                {/* X */}
                <SheetClose asChild>
                  <button
                    aria-label="Zamknij menu"
                    className="absolute right-3 top-1/2 -translate-y-1/2 grid h-9 w-9 place-items-center rounded-md cursor-pointer text-white/80 hover:text-white hover:bg-white/5 outline-none focus-visible:ring-2 focus-visible:ring-white/30">
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round">
                      <path d="M18 6 6 18" />
                      <path d="m6 6 12 12" />
                    </svg>
                  </button>
                </SheetClose>
              </div>

              {/* Linki */}
              <nav className="mt-2 flex flex-col gap-1 px-2">
                {NAV.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      cn(
                        "rounded-md px-3 py-2 text-[16px] font-semibold tracking-wide cursor-pointer",
                        "text-white/90 hover:bg-white/5 hover:text-white",
                        isActive && "text-[var(--gv-accent)]"
                      )
                    }>
                    {item.label}
                  </NavLink>
                ))}
              </nav>

              <Separator className="my-6 border-white/10" />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
