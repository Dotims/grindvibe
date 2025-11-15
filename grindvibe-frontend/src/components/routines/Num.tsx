import React from "react";
import { Input } from "../../components/ui/input";

type Props = {
  label: string;
  value: number | null | undefined;
  onChange: (v: number | null) => void;
  placeholder?: string;
};

export default function Num({ label, value, onChange, placeholder }: Props) {
  const handle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    onChange(raw === "" ? null : Number(raw));
  };
  return (
    <div>
      <label className="text-xs block mb-1">{label}</label>
      <Input
        type="number"
        value={value ?? ""}
        onChange={handle}
        placeholder={placeholder}
        className="h-9 rounded-full border-border/40 focus-visible:ring-2"
        style={{ outline: "none", boxShadow: "none" }}
      />
    </div>
  );
}