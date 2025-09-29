import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function parseExerciseSteps(desc?: string | null): string[] {
  if (!desc) return [];
  const normalized = desc.replace(/\s+/g, " ").trim();
  const re = /Step:?\s*\d+\s*(.*?)(?=Step:?\s*\d+|$)/gi; // group by "Step: <number>"
  const steps: string[] = [];
  let m: RegExpExecArray | null;

  while ((m = re.exec(normalized)) !== null) {
    const text = m[1].trim();
    if (text) steps.push(text);
  }

  return steps;
}