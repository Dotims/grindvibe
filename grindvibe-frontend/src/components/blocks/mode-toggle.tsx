// src/components/blocks/mode-toggle.tsx
import { Moon, Sun, Laptop } from "lucide-react"
import { Button } from "../ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { useTheme } from "../theme/use-theme"

export default function ModeToggle() {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          aria-label="Zmień motyw"
          className="relative cursor-pointer border-[var(--gv-border)]"
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="gv-menu min-w-[12rem]"
          >
          <DropdownMenuItem
            className="cursor-pointer focus:bg-black/5 dark:focus:bg-white/10"
            onClick={() => setTheme("light")}
          >
            <Sun className="mr-2 h-4 w-4" /> Jasny
          </DropdownMenuItem>

          <DropdownMenuItem
            className="cursor-pointer focus:bg-black/5 dark:focus:bg-white/10"
            onClick={() => setTheme("dark")}
          >
            <Moon className="mr-2 h-4 w-4" /> Ciemny
          </DropdownMenuItem>

          <DropdownMenuItem
            className="cursor-pointer focus:bg-black/5 dark:focus:bg-white/10"
            onClick={() => setTheme("system")}
          >
            <Laptop className="mr-2 h-4 w-4" /> System
          </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
