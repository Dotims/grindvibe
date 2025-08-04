"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Calendar, Settings, Lock, LogOut, Crown } from "lucide-react"

export default function AccountPage() {
  // Placeholder user data
  const userData = {
    firstName: "test",
    lastName: "test",
    email: "test@example.com",
    accountType: "Premium - test",
    createdAt: "(testDate) 15 marca 2023",
    lastLogin: "(test) Dziś o 14:30",
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Welcome Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">Witaj ponownie, {userData.firstName}!</h1>
          <p className="text-lg text-muted-foreground">Zarządzaj swoim kontem i ustawieniami EchoLetters</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Account Details Section */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-primary" />
                  <span>Informacje o koncie</span>
                </CardTitle>
                <CardDescription>Podstawowe dane Twojego konta EchoLetters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span>Imię i nazwisko</span>
                    </div>
                    <p className="text-lg font-medium">
                      {userData.firstName} {userData.lastName}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span>Adres e-mail</span>
                    </div>
                    <p className="text-lg font-medium">{userData.email}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Crown className="h-4 w-4" />
                      <span>Typ konta</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="text-white" style={{ backgroundColor: "#FF7D29" }}>
                        {userData.accountType}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Data utworzenia</span>
                    </div>
                    <p className="text-lg font-medium">{userData.createdAt}</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <span>Ostatnie logowanie</span>
                  </div>
                  <p className="text-sm font-medium">{userData.lastLogin}</p>
                </div>
              </CardContent>
            </Card>

            {/* Account Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Twoja aktywność</CardTitle>
                <CardDescription>Podsumowanie Twojej aktywności na platformie</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center space-y-2">
                    <p className="text-3xl font-bold text-primary">24</p>
                    <p className="text-sm text-muted-foreground">Przesłuchane audiobooki</p>
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-3xl font-bold text-primary">156</p>
                    <p className="text-sm text-muted-foreground">Godziny słuchania</p>
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-3xl font-bold text-primary">8</p>
                    <p className="text-sm text-muted-foreground">Ulubione audiobooki</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Szybkie akcje</CardTitle>
                <CardDescription>Zarządzaj swoim kontem i ustawieniami</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start h-12 bg-transparent">
                  <Settings className="h-4 w-4 mr-3" />
                  Edytuj profil
                </Button>

                <Button variant="outline" className="w-full justify-start h-12 bg-transparent">
                  <Lock className="h-4 w-4 mr-3" />
                  Zmień hasło
                </Button>

                <Separator />

                <Button
                  variant="outline"
                  className="w-full justify-start h-12 text-destructive hover:text-destructive bg-transparent"
                >
                  <LogOut className="h-4 w-4 mr-3" />
                  Wyloguj się
                </Button>
              </CardContent>
            </Card>

            {/* Account Status */}
            <Card>
              <CardHeader>
                <CardTitle>Status konta</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  >
                    Aktywne
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Subskrypcja</span>
                  <Badge variant="secondary" className="text-white" style={{ backgroundColor: "#FF7D29" }}>
                    Premium
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Odnowienie</span>
                  <span className="text-sm font-medium">15 kwietnia 2024</span>
                </div>

                <Separator />

                <Button className="w-full text-white" style={{ backgroundColor: "#FF7D29" }}>
                  Zarządzaj subskrypcją
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Ostatnia aktywność</CardTitle>
            <CardDescription>Twoje ostatnie działania na platformie</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 rounded-lg bg-muted/50">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Ukończono audiobook Wiedźmin: Ostatnie życzenie</p>
                  <p className="text-xs text-muted-foreground">2 godziny temu</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 p-4 rounded-lg bg-muted/50">
                <div className="w-2 h-2 rounded-full bg-muted-foreground"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Dodano do ulubionych Sapiens: Od zwierząt do bogów</p>
                  <p className="text-xs text-muted-foreground">1 dzień temu</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 p-4 rounded-lg bg-muted/50">
                <div className="w-2 h-2 rounded-full bg-muted-foreground"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Rozpoczęto słuchanie Atomowe nawyki</p>
                  <p className="text-xs text-muted-foreground">3 dni temu</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
