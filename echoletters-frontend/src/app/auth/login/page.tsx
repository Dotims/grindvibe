"use client"

import { AuthShowcase } from "@/components/AuthShowcase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="bg-background min-h-screen overflow-hidden">
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Left Side - Form */}
        <div className="flex-1 lg:basis-[70%] flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md lg:max-w-xl xl:max-w-2xl space-y-8">
            {/* Header */}
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold text-foreground">Witaj ponownie</h1>
              <p className="text-muted-foreground">Zaloguj się, aby kontynuować swoją audio‑podróż</p>
            </div>

            {/* Form */}
            <form className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Adres e‑mail</Label>
                  <Input id="email" type="email" placeholder="Wpisz swój e‑mail" className="h-12" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Hasło</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Wpisz swoje hasło"
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
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <input id="remember" type="checkbox" className="rounded border-input" />
                    <Label htmlFor="remember" className="text-sm">Zapamiętaj mnie</Label>
                  </div>
                  <Link href="/auth/forgot-password" className="text-sm text-primary hover:underline">
                    Zapomniałeś hasła?
                  </Link>
                </div>
              </div>

              <Button type="submit" className="w-full h-12 text-white" style={{ backgroundColor: "#FF7D29" }}>
                Zaloguj się
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
              Nie masz konta?{" "}
              <Link href="/auth/register" className="text-primary hover:underline font-medium">
                Zarejestruj się
              </Link>
            </p>
          </div>
        </div>

        {/* Right Side - ShowCase */}
        <div className="hidden lg:flex lg:basis-[30%] relative bg-muted items-stretch">
          <div className="w-full h-full">
            <AuthShowcase />
          </div>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-l-2xl" />
        </div>
      </div>
    </div>
  )
}
