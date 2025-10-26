import { NavLink } from "react-router-dom";
import { cn } from "../../lib/utils";

const PRIMARY = [
  { to: "/", label: "Strona główna" },
  { to: "/cwiczenia", label: "Ćwiczenia" },
  { to: "/plan", label: "Plan treningowy" },
  { to: "/profil", label: "Profil" },
];

const SECONDARY = [
  { to: "/polityka-prywatnosci", label: "Polityka prywatności" },
  { to: "/regulamin", label: "Regulamin" },
  { to: "/kontakt", label: "Kontakt" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className={cn(
        "mt-10 w-full border-t border-[var(--gv-border)]",
        "bg-[rgb(var(--gv-header-bg)/0.66)] backdrop-blur-md supports-[backdrop-filter]:bg-[rgb(var(--gv-header-bg)/0.52)]"
      )}
    >
      <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
        <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm sm:gap-x-5">
          {PRIMARY.map((item, i) => (
            <span key={item.to} className="inline-flex items-center">
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "px-1 py-1 font-medium transition-colors",
                    "text-[var(--gv-text-soft)] hover:text-[var(--gv-text)]",
                    isActive && "text-[var(--gv-accent)]"
                  )
                }
              >
                {item.label}
              </NavLink>
              {i < PRIMARY.length - 1 && (
                <span className="mx-3 hidden text-[12px] text-[var(--gv-border)] sm:inline">
                  •
                </span>
              )}
            </span>
          ))}
        </nav>

        <nav className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-[13px]">
          {SECONDARY.map((item, i) => (
            <span key={item.to} className="inline-flex items-center">
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "px-1 py-1 transition-colors",
                    "text-[var(--gv-text-soft)] hover:text-[var(--gv-text)]",
                    isActive && "text-[var(--gv-accent)]"
                  )
                }
              >
                {item.label}
              </NavLink>
              {i < SECONDARY.length - 1 && (
                <span className="mx-2 text-[12px] text-[var(--gv-border)]">·</span>
              )}
            </span>
          ))}
        </nav>

        <div className="mt-6 text-center">
          <p className="text-xs text-[var(--gv-text-soft)]">
            © {year} GrindVibe. Wszelkie prawa zastrzeżone.
          </p>
        </div>
      </div>
    </footer>
  );
}
