"use client"

import Link from "next/link"
import { Headphones, Twitter, Instagram, Youtube, Facebook } from "lucide-react"
import { Separator } from "@/components/ui/separator"

const navigationLinks = [
  { title: "Strona główna", href: "/" },
  { title: "Biblioteka", href: "/library" },
  { title: "Kategorie", href: "/categories" },
  { title: "O cvsdfsdfsdffnas", href: "/about" },
  { title: "Kontakt", href: "/contact" },
]

const socialLinks = [
  { title: "Twitter", href: "https://twitter.com", icon: Twitter },
  { title: "Instagram", href: "https://instagram.com", icon: Instagram },
  { title: "YouTube", href: "https://youtube.com", icon: Youtube },
  { title: "Facebook", href: "https://facebook.com", icon: Facebook },
]

export default function Footer() {
  return (
    <footer className="border-t bg-background flex justify-center">
      <div className="container px-4 py-8 md:py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Left Section - Brand */}
          <div className="space-y-4 md:col-span-1 lg:col-span-1">
            <Link href="/" className="flex items-center space-x-2">
              <Headphones className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold text-foreground">EchoLetters</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              Historie, które do Ciebie mówią. Odkryj swój następny ulubiony audiobook w naszej starannie wyselekcjonowanej kolekcji.
            </p>
          </div>

          {/* Center Section - Navigation Links */}
          <div className="space-y-4 md:col-span-1 lg:col-span-1">
            <h3 className="text-sm font-semibold text-foreground">Nawigacja</h3>
            <nav className="flex flex-col space-y-3">
              {navigationLinks.map((link) => (
                <Link
                  key={link.title}
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {link.title}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right Section - Social Media */}
          <div className="space-y-4 md:col-span-2 lg:col-span-1">
            <h3 className="text-sm font-semibold text-foreground">Obserwuj nas</h3>
            <div className="flex space-x-4">
              {socialLinks.map((social) => {
                const IconComponent = social.icon
                return (
                  <Link
                    key={social.title}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                    aria-label={`Obserwuj nas na ${social.title}`}
                  >
                    <IconComponent className="h-5 w-5" />
                  </Link>
                )
              })}
            </div>
            <p className="text-xs text-muted-foreground">Bądź na bieżąco z nowościami i ekskluzywnymi treściami.</p>
          </div>
        </div>

        {/* Separator */}
        <Separator className="my-6 md:my-8" />

        {/* Bottom Bar - Copyright */}
        <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
          <p className="text-xs text-muted-foreground">© 2025 EchoLetters. Wszelkie prawa zastrzeżone.</p>
          <div className="flex space-x-4 text-xs">
            <Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
              Polityka prywatności
            </Link>
            <Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">
              Regulamin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
