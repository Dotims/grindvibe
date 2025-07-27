"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import AuthLayout from "../AuthLayout"

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  return (
    <AuthLayout>
      <div className="w-full max-w-md lg:max-w-xl xl:max-w-2xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Utwórz konto</h1>
          <p className="text-muted-foreground">
            Dołącz do tysięcy słuchaczy i rozpocznij swoją audio‑przygodę już dziś
          </p>
        </div>

        <form className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Imię</Label>
                <Input id="firstName" type="text" placeholder="Jan" className="h-12" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nazwisko</Label>
                <Input id="lastName" type="text" placeholder="Kowalski" className="h-12" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Adres e‑mail</Label>
              <Input id="email" type="email" placeholder="jan@przyklad.com" className="h-12" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Hasło</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Utwórz silne hasło"
                  className="h-12 pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Musi mieć co najmniej 8 znaków oraz zawierać cyfry i litery
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Potwierdź hasło</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Potwierdź swoje hasło"
                  className="h-12 pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <input id="terms" type="checkbox" className="rounded border-input mt-1" required />
              <Label htmlFor="terms" className="text-sm leading-5">
                Akceptuję{" "}
                <Link href="/terms" className="text-primary hover:underline">Regulamin</Link>{" "}
                oraz{" "}
                <Link href="/privacy" className="text-primary hover:underline">Politykę prywatności</Link>
              </Label>
            </div>
          </div>

          <Button type="submit" className="w-full h-12 text-white" style={{ backgroundColor: "#FF7D29" }}>
            Utwórz konto
          </Button>

          <div className="relative">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
              LUB
            </span>
          </div>

          <Button variant="outline" className="w-full h-12 bg-transparent">
            Kontynuuj przez Google
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Masz już konto?{" "}
          <Link href="/auth/login" className="text-primary hover:underline font-medium">
            Zaloguj się
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
