import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header"
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/components/ui/themeProvider";
import Home from "@/app/page"

export const metadata: Metadata = {
  title: "EchoLetters – Biblioteka Audiobooków",
  description: "Discover and listen to your favorite audiobooks for free in a beautiful bookish experience.",
};

export default function RootLayout() {
  return (
    <html lang="pl">
      <body cz-shortcut-listen="true" suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Header />
          <Home />
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
