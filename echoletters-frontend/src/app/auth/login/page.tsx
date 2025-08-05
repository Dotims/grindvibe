"use client"

import { saveToken } from "@/lib/auth";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import AuthLayout from "../AuthLayout"
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter();
  const [email, setEmail ] = useState("")
  const [password, setPassword ] = useState("")
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const handleLogin = async (e?: React.FormEvent) => {
    e?.preventDefault();
    try {
      const res = await fetch("http://localhost:5257/api/auth/login", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ email, password})
      })

      if (res.ok) {
        router.push("/account")
        const data = await res.json();
        saveToken(data.token)
      } else {
        setModalMessage("Logowanie nie powiodło się. Spróbuj ponownie.");
        setModalOpen(true)
      } 
    } catch (err) {
       setModalMessage("Wystąpił błąd sieci. Spróbuj ponownie.");
       setModalOpen(true) 
      }
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-md lg:max-w-xl xl:max-w-2xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Witaj ponownie</h1>
          <p className="text-muted-foreground">Zaloguj się, aby kontynuować swoją audio‑podróż</p>
        </div>

        <form className="space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Adres e‑mail</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="Wpisz swój e‑mail" 
                className="h-12" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

          <Button type="submit" className="w-full h-12 text-white cursor-pointer" style={{ backgroundColor: "#FF7D29" }}>
            Zaloguj się
          </Button>

          <div className="relative">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
              LUB
            </span>
          </div>

          <Button onClick={handleLogin} variant="outline" className="w-full h-12 bg-transparent cursor-pointer">
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

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Błąd logowania</DialogTitle>
            <DialogDescription>{modalMessage}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => setModalOpen(false)}
              className="w-full cursor-pointer"
            >
              Spróbuj ponownie
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </AuthLayout>
  )
}