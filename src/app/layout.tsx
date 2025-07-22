import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header"
import { ThemeProvider } from "@/components/ui/themeProvider";

export const metadata: Metadata = {
  title: "EchoLetters – Biblioteka Audiobooków",
  description: "Discover and listen to your favorite audiobooks for free in a beautiful bookish experience.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body cz-shortcut-listen="true">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Header />
          {children}  
        </ThemeProvider>
      </body>
    </html>
  );
}
