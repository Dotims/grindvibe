import * as React from "react"
import * as SheetPrimitive from "@radix-ui/react-dialog"
import { XIcon } from "lucide-react"
import { cn } from "../../lib/utils"

/** Root / Trigger / Close / Portal — bez zmian API */
function Sheet(props: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />
}
function SheetTrigger(props: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />
}
function SheetClose(props: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />
}
function SheetPortal(props: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />
}

/** Overlay — ciemny, z animacjami i właściwym z-index */
function SheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn(
        "fixed inset-0 z-[60] bg-black/60",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
        className
      )}
      {...props}
    />
  )
}

/** Content — jeden działający X, animacje, pełne tło */
function SheetContent({
  className,
  children,
  side = "right",
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: "top" | "right" | "bottom" | "left"
}) {
  const sideClasses =
    side === "right"
      ? "right-0 top-0 h-full w-3/4 sm:max-w-sm border-l data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right"
      : side === "left"
      ? "left-0 top-0 h-full w-3/4 sm:max-w-sm border-r data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left"
      : side === "top"
      ? "top-0 left-0 w-full border-b data-[state=open]:slide-in-from-top data-[state=closed]:slide-out-to-top"
      : "bottom-0 left-0 w-full border-t data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom"

  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        data-side={side}
        className={cn(
          "fixed z-[70] flex flex-col gap-4 p-0 outline-none shadow-lg",
          // animacje open/close (wymaga tailwindcss-animate w configu)
          "data-[state=open]:animate-in data-[state=closed]:animate-out duration-300",
          // tła wg zmiennych z index.css (nieprzezroczyste)
          "bg-white text-black dark:bg-[#0B0B0F] dark:text-white",
          sideClasses,
          className
        )}
        {...props}
      >
        {/* JEDYNY przycisk zamknięcia (działa, bo to Dialog.Close) */}
        <SheetPrimitive.Close
          aria-label="Close"
          className={cn(
            "absolute right-3 top-1/2 -translate-y-1/2",
            "grid h-9 w-9 place-items-center rounded-md",
            "cursor-pointer text-white/80 hover:text-white hover:bg-white/5",
            "outline-none focus-visible:ring-2 focus-visible:ring-white/30"
          )}
        >
          <XIcon className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </SheetPrimitive.Close>

        {children}
      </SheetPrimitive.Content>
    </SheetPortal>
  )
}

/** Dodatkowe helpery — zostawiam jak u Ciebie */
function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="sheet-header" className={cn("flex flex-col gap-1.5 p-4", className)} {...props} />
  )
}
function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="sheet-footer" className={cn("mt-auto flex flex-col gap-2 p-4", className)} {...props} />
  )
}
function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn("font-semibold text-foreground", className)}
      {...props}
    />
  )
}
function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
