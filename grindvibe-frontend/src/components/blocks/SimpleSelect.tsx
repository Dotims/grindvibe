import { Listbox, Transition } from "@headlessui/react";
import { ChevronDown, Check } from "lucide-react";
import { Fragment } from "react";
import { cn } from "../../lib/utils";

type SimpleSelectProps = {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
  className?: string;
};

export default function SimpleSelect({
  value,
  onChange,
  options,
  placeholder,
  className,
}: SimpleSelectProps) {
  return (
    <Listbox value={value} onChange={onChange}>
      <div className={cn("relative", className)}>
        <Listbox.Button
          className="
            w-full h-10 rounded-md border border-[var(--gv-border)]
            bg-background text-sm px-3 pr-9 text-left
            hover:bg-white/70 dark:hover:bg-zinc-800/60
            transition
          "
        >
          <span className={cn(!value && "text-muted-foreground")}>
            {value || placeholder}
          </span>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 opacity-70" />
        </Listbox.Button>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="opacity-0 -translate-y-1"
          enterTo="opacity-100 translate-y-0"
          leave="transition ease-in duration-75"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 -translate-y-1"
        >
          <Listbox.Options
            className="
              absolute z-50 mt-2 w-full overflow-auto rounded-md border border-[var(--gv-border)]
              bg-white dark:bg-zinc-900 shadow-xl focus:outline-none max-h-72
            "
          >
            <Listbox.Option
              key="__all__"
              value=""
              className={({ active }) =>
                cn(
                  "cursor-pointer px-3 py-2 text-sm",
                  active ? "bg-[var(--gv-accent)]/10 text-foreground" : "text-foreground"
                )
              }
            >
              {({ selected }) => (
                <div className="flex items-center gap-2">
                  {selected ? <Check className="h-4 w-4" /> : <span className="h-4 w-4" />}
                  <span>All</span>
                </div>
              )}
            </Listbox.Option>

            {options.map((opt) => (
              <Listbox.Option
                key={opt}
                value={opt}
                className={({ active }) =>
                  cn(
                    "cursor-pointer px-3 py-2 text-sm",
                    active ? "bg-[var(--gv-accent)]/10 text-foreground" : "text-foreground"
                  )
                }
              >
                {({ selected }) => (
                  <div className="flex items-center gap-2">
                    {selected ? <Check className="h-4 w-4" /> : <span className="h-4 w-4" />}
                    <span>{opt}</span>
                  </div>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
}
