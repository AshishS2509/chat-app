import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function createLocalMongoId(): string {
  const timestamp = Math.floor(Date.now() / 1000).toString(16);
  const random = crypto
    .getRandomValues(new Uint8Array(8))
    .reduce((acc, b) => acc + b.toString(16).padStart(2, "0"), "")
    .slice(0, 16);

  return timestamp + random; // 24 hex chars like MongoDB ObjectId
}
