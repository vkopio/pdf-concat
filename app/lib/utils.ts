import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateNewFileName(oldName: string): string {
  const name = oldName.substring(0, oldName.lastIndexOf('.'));
  const separator = determineFileNameSeparator(oldName);

  return `${name}${separator}with${separator}attachments`;
}


function determineFileNameSeparator(name: string): string {
  if (name.includes(" ")) {
    return " ";
  }

  if (name.includes("_")) {
    return "_";
  }

  return "-";
}
