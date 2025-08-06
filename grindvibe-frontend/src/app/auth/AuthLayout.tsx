import { ReactNode } from "react"
import { AuthShowcase } from "@/components/AuthShowcase"

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-background min-h-screen overflow-hidden">
      <div className="flex flex-col lg:flex-row min-h-screen">
        <div className="flex-1 lg:basis-[65%] flex items-center justify-center p-6 lg:p-12">
          {children}
        </div>

        <div className="hidden lg:flex lg:basis-[35%] relative bg-muted items-stretch">
          <div className="w-full h-full">
            <AuthShowcase />
          </div>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-l-2xl" />
        </div>
      </div>
    </div>
  )
}
