export function debounce<T extends (...args: never[]) => void>(fn: T, delay: number): T {
  void delay;
  return fn;
}
