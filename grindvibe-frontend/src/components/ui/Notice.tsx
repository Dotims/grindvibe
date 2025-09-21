type NoticeProps = {
  kind?: "info" | "warn" | "error";
  children: React.ReactNode;
  className?: string;
};

export function Notice({ kind = "info", children, className }: NoticeProps) {
  const base = "mb-4 rounded-xl p-3 text-sm";
  const map = {
    info:  "bg-muted/50 text-muted-foreground",
    warn:  "bg-amber-50 text-amber-800 dark:bg-amber-900/20 dark:text-amber-200",
    error: "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-200",
  } as const;

  return (
    <div className={`${base} ${map[kind]} ${className ?? ""}`}>
      {children}
    </div>
  );
}
