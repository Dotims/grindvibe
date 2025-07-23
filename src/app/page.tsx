import HeroSection from "@/components/HeroSection"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
       <main className="flex gap-[32px] flex-col  sm:items-start row-start-2"> {/* flex flex-col gap-[32px]  items-center sm:items-start */}
        <HeroSection />
      </main>
    </div>
  );
}
