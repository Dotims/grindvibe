import { Link } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Input } from "@/components/ui/input"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Search, Menu, Dumbbell, User, LogIn } from "lucide-react"
import ModeToggle from "@/components/mode-toggle"

export default function Header() {
  return (
    <header className="sticky flex justify-center top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
          <Dumbbell className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold text-foreground">Sportify</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center space-x-4 xl:space-x-6 flex-1 justify-center max-w-2xl">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    to="/"
                    className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-3 xl:px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    Feed
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    to="/routines"
                    className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-3 xl:px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    Treningi
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    to="/exercises"
                    className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-3 xl:px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    Ćwiczenia
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    to="/profile"
                    className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-3 xl:px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    Profil
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    to="/settings"
                    className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-3 xl:px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    Ustawienia
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* Search */}
          <div className="relative flex-shrink-0">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Szukaj ćwiczeń..."
              className="w-48 xl:w-64 pl-10"
            />
          </div>
        </div>

        {/* Mobile Menu */}
        <div className="flex lg:hidden items-center space-x-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px] md:p-6">
              <SheetHeader>
                <SheetTitle className="flex items-center space-x-2">
                  <Dumbbell className="h-5 w-5 text-primary" />
                  <span>Sportify</span>
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col space-y-4 mt-6 p-3">
                <Link to="/" className="text-lg font-medium hover:text-primary transition-colors">
                  Feed
                </Link>
                <Link to="/routines" className="text-lg font-medium hover:text-primary transition-colors">
                  Treningi
                </Link>
                <Link to="/exercises" className="text-lg font-medium hover:text-primary transition-colors">
                  Ćwiczenia
                </Link>
                <Link to="/profile" className="text-lg font-medium hover:text-primary transition-colors">
                  Profil
                </Link>
                <Link to="/settings" className="text-lg font-medium hover:text-primary transition-colors">
                  Ustawienia
                </Link>

                <div className="pt-4 border-t space-y-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Motyw</span>
                    <ModeToggle />
                  </div>
                  <Button variant="ghost" className="w-full justify-start" asChild>
                    <Link to="/auth/login">
                      <LogIn className="h-4 w-4 mr-2" />
                      Zaloguj się
                    </Link>
                  </Button>
                  <Button className="w-full justify-start" asChild>
                    <Link to="/auth/register">
                      <User className="h-4 w-4 mr-2" />
                      Zarejestruj się
                    </Link>
                  </Button>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
