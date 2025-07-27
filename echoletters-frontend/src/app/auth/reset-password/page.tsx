"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Shield } from "lucide-react"
import { useState } from "react"
import AuthLayout from "../AuthLayout"

export default function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  return (
    <AuthLayout>
      <div className="w-full max-w-md lg:max-w-xl xl:max-w-2xl space-y-8">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Zresetuj hasło</h1>
          <p className="text-muted-foreground">
            Wpisz poniżej nowe hasło. Upewnij się, że jest silne i bezpieczne.
          </p>
        </div>

        <form className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Nowe hasło</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Wpisz nowe hasło"
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
                Musi mieć co najmniej 8 znaków i zawierać cyfry oraz litery
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Potwierdź nowe hasło</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Potwierdź swoje nowe hasło"
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

            {/* Password strength indicator */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Siła hasła:</p>
              <div className="flex space-x-1">
                <div className="h-2 w-full bg-muted rounded-full">
                  <div className="h-2 w-1/3 bg-red-500 rounded-full"></div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Słabe – dodaj więcej znaków</p>
            </div>
          </div>

          <Button type="submit" className="w-full h-12 text-white" style={{ backgroundColor: "#FF7D29" }}>
            Zaktualizuj hasło
          </Button>
        </form>

        {/* Security note */}
        <div className="text-center p-4 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground">
            Po zaktualizowaniu hasła zostaniesz automatycznie zalogowany(-a) do swojego konta.
          </p>
        </div>
      </div>
    </AuthLayout>
  )
}
