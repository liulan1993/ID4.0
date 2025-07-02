// cn 函数用于合并 Tailwind CSS 类名
export function cn(...classes: (string | undefined | null | boolean)[]): string {
  return classes.filter(Boolean).join(" ");
}
