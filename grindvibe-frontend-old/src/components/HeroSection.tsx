"use client"

import { Button } from "@/components/ui/button"
import Image from "next/image"

export default function HeroSection() {
  return (
    <section className="relative w-full bg-background overflow-hidden">
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background: "linear-gradient(to bottom, transparent 0%, #FF7D2944 40%, #FF7D2944 60%, transparent 100%)",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-24 !container">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">
          <div className="flex-1 text-center lg:text-left space-y-6 lg:space-y-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground leading-tight">
              Rozbudź swoją wyobraźnię
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-2xl mx-auto lg:mx-0">
              Historie ożywione przez urzekające głosy.
            </p>
            <div className="pt-4">
              <Button
                size="lg"
                className="text-lg px-8 py-6 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 text-white"
                style={{ backgroundColor: "#FF7D29" }}
              >
                Rozpocznij
              </Button>
            </div>
          </div>

          <div className="flex-1 relative w-full max-w-2xl">
            <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px]">
              {/* Cover 1 */}
              <div className="absolute top-8 left-0 w-40 h-48 md:w-48 md:h-56 xl:w-52 xl:h-60 transform -rotate-12 hover:rotate-0 hover:scale-110 transition-all duration-500 z-20">
                <Image
                  src="/featured-books/featured-psycho.png"
                  alt="Audiobook kryminalny / thriller"
                  fill
                  className="object-cover rounded-lg shadow-xl !w-auto"
                />
              </div>

              {/* Cover 2 */}
              <div className="absolute top-4 right-10 w-36 h-44 md:w-44 md:h-52 xl:w-48 xl:h-56 transform rotate-6 hover:rotate-0 hover:scale-110 transition-all duration-500 z-10">
                <Image
                  src="/featured-books/featured-romantic.png"
                  alt="Audiobook romans"
                  fill
                  className="object-cover rounded-lg shadow-xl !w-auto"
                />
              </div>

              {/* Cover 3 */}
              <div className="absolute top-30 left-20 w-40 h-48 md:w-48 md:h-56 xl:w-52 xl:h-60 transform rotate-3 hover:rotate-0 hover:scale-110 transition-all duration-500 z-30">
                <Image
                  src="/featured-books/featured-fantasy.png"
                  alt="Audiobook fantasy – przygoda"
                  fill
                  className="object-cover rounded-lg shadow-xl !w-auto"
                />
              </div>

              {/* Cover 4 */}
              <div className="absolute top-35 right-32 w-40 h-48 md:w-48 md:h-56 xl:w-52 xl:h-60 transform -rotate-6 hover:rotate-0 hover:scale-110 transition-all duration-500 z-15">
                <Image
                  src="/featured-books/featured-scienceFiction.png"
                  alt="Audiobook science fiction"
                  fill
                  className="object-cover rounded-lg shadow-xl !w-auto"
                />
              </div>

              {/* Cover 5 */}
              <div className="absolute bottom-5 left-10 w-36 h-44 md:w-44 md:h-52 xl:w-48 xl:h-56 transform rotate-12 hover:rotate-0 hover:scale-110 transition-all duration-500 z-25">
                <Image
                  src="/featured-books/featured-selfHelp.png"
                  alt="Audiobook rozwojowy (self‑help)"
                  fill
                  className="object-cover rounded-lg shadow-xl !w-auto"
                />
              </div>

              {/* Cover 6 */}
              <div className="absolute bottom-0 right-20 w-38 h-46 md:w-46 md:h-54 xl:w-50 xl:h-58 transform -rotate-3 hover:rotate-0 hover:scale-110 transition-all duration-500 z-20">
                <Image
                  src="/featured-books/featured-historical.png"
                  alt="Audiobook – powieść historyczna"
                  fill
                  className="object-cover rounded-lg shadow-xl !w-auto"
                />
              </div>

              {/* Accent Elements */}
              <div
                className="absolute top-1/4 right-1/4 w-3 h-3 rounded-full opacity-60 animate-pulse"
                style={{ backgroundColor: "#FFEEA9" }}
              />
              <div
                className="absolute bottom-1/3 left-1/3 w-2 h-2 rounded-full opacity-40 animate-pulse"
                style={{ backgroundColor: "#FF7D29" }}
              />
              <div
                className="absolute top-1/2 left-1/4 w-4 h-4 rounded-full opacity-30 animate-pulse"
                style={{ backgroundColor: "#FFEEA9" }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
