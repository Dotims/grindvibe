"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Mail } from "lucide-react"
import Link from "next/link"
import AuthLayout from "../AuthLayout"

export default function ForgotPasswordPage() {
  return (
    <AuthLayout>
      <div className="w-full max-w-md lg:max-w-xl xl:max-w-2xl space-y-8">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Zapomniałeś hasła?</h1>
          <p className="text-muted-foreground">
            Spokojnie! Podaj swój adres e‑mail, a wyślemy Ci link do zresetowania hasła.
          </p>
        </div>

        <form className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Adres e‑mail</Label>
              <Input id="email" type="email" placeholder="Wpisz swój adres e‑mail" className="h-12" required />
              <p className="text-xs text-muted-foreground">
                Wyślemy na ten adres link do resetu hasła
              </p>
            </div>
          </div>

          <Button type="submit" className="w-full h-12 text-white" style={{ backgroundColor: "#FF7D29" }}>
            Wyślij link resetujący
          </Button>
        </form>

        <div className="text-center">
          <Link
            href="/auth/login"
            className="inline-flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Wróć do logowania</span>
          </Link>
        </div>

        <div className="text-center p-4 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground">
            Nie otrzymałeś e‑maila? Sprawdź folder spam lub{" "}
            <button className="text-primary hover:underline">spróbuj ponownie</button>
          </p>
        </div>
      </div>
    </AuthLayout>
  )
}
