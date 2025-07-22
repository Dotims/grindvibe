"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Search, Menu, Headphones, User, LogIn } from "lucide-react"
import Link from "next/link"
import ModeToggle from "@/components/mode-toggle"

const categories = [
  { title: "Fiction", href: "/categories/fiction" },
  { title: "Non-Fiction", href: "/categories/non-fiction" },
  { title: "Mystery & Thriller", href: "/categories/mystery" },
  { title: "Romance", href: "/categories/romance" },
  { title: "Sci-Fi & Fantasy", href: "/categories/sci-fi" },
  { title: "Biography", href: "/categories/biography" },
]

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 max-w-full">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
          <Headphones className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold text-foreground">EchoLetters</span>
        </Link>

        {/* Desktop Navigation - Hidden on md, shown on lg+ */}
        <div className="hidden lg:flex items-center space-x-4 xl:space-x-6 flex-1 justify-center max-w-2xl">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    href="/"
                    className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-3 xl:px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50"
                  >
                    Home
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    href="/library"
                    className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-3 xl:px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50"
                  >
                    Library
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger className="px-3 xl:px-4">Categories</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                    {categories.map((category) => (
                      <li key={category.title}>
                        <NavigationMenuLink asChild>
                          <Link
                            href={category.href}
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="text-sm font-medium leading-none">{category.title}</div>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    href="/about"
                    className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-3 xl:px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50"
                  >
                    About
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* Search Bar - Responsive width */}
          <div className="relative flex-shrink-0">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input type="search" placeholder="Search audiobooks..." className="w-48 xl:w-64 pl-10" />
          </div>
        </div>

        {/* Medium Screen Layout (md to lg) - Simplified */}
        <div className="hidden md:flex lg:hidden items-center space-x-3 flex-1 justify-end max-w-md">
          {/* Compact Search */}
          <div className="relative flex-shrink-0">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input type="search" placeholder="Search..." className="w-40 pl-10" />
          </div>

          {/* Navigation Menu Button */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <Menu className="h-4 w-4" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px] p-6">
              <SheetHeader>
                <SheetTitle className="flex items-center space-x-2">
                  <Headphones className="h-5 w-5 text-primary" />
                  <span>EchoLetters</span>
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col space-y-4 mt-6">
                <Link href="/" className="text-lg font-medium hover:text-primary transition-colors">
                  Home
                </Link>
                <Link href="/library" className="text-lg font-medium hover:text-primary transition-colors">
                  Library
                </Link>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Categories</h3>
                  <div className="pl-4 space-y-2">
                    {categories.map((category) => (
                      <Link
                        key={category.title}
                        href={category.href}
                        className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        {category.title}
                      </Link>
                    ))}
                  </div>
                </div>

                <Link href="/about" className="text-lg font-medium hover:text-primary transition-colors">
                  About
                </Link>

                <div className="pt-4 border-t space-y-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Theme</span>
                    <ModeToggle />
                  </div>
                  <Button variant="ghost" className="w-full justify-start" asChild>
                    <Link href="/login">
                      <LogIn className="h-4 w-4 mr-2" />
                      Login
                    </Link>
                  </Button>
                  <Button className="w-full justify-start" asChild>
                    <Link href="/signup">
                      <User className="h-4 w-4 mr-2" />
                      Sign Up
                    </Link>
                  </Button>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop Auth Buttons - Only shown on lg+ */}
        <div className="hidden lg:flex items-center space-x-1 xl:space-x-2 flex-shrink-0">
          <ModeToggle />
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">
              <LogIn className="h-4 w-4 mr-2" />
              Login
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/signup">
              <User className="h-4 w-4 mr-2" />
              Sign Up
            </Link>
          </Button>
        </div>

        {/* Mobile Menu - Only shown below md */}
        <div className="md:hidden flex items-center space-x-2 m p-6">
          {/* Mobile Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input type="search" placeholder="Search..." className="w-32 pl-10 text-xs" />
          </div>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px] p-6">
              <SheetHeader>
                <SheetTitle className="flex items-center space-x-2">
                  <Headphones className="h-5 w-5 text-primary" />
                  <span>EchoLetters</span>
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col space-y-4 mt-6">
                <Link href="/" className="text-lg font-medium hover:text-primary transition-colors">
                  Home
                </Link>
                <Link href="/library" className="text-lg font-medium hover:text-primary transition-colors">
                  Library
                </Link>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Categories</h3>
                  <div className="pl-4 space-y-2">
                    {categories.map((category) => (
                      <Link
                        key={category.title}
                        href={category.href}
                        className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        {category.title}
                      </Link>
                    ))}
                  </div>
                </div>

                <Link href="/about" className="text-lg font-medium hover:text-primary transition-colors">
                  About
                </Link>

                <div className="pt-4 border-t space-y-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Theme</span>
                    <ModeToggle />
                  </div>
                  <Button variant="ghost" className="w-full justify-start" asChild>
                    <Link href="/login">
                      <LogIn className="h-4 w-4 mr-2" />
                      Login
                    </Link>
                  </Button>
                  <Button className="w-full justify-start" asChild>
                    <Link href="/signup">
                      <User className="h-4 w-4 mr-2" />
                      Sign Up
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
