export function encodeFileName(input: string): string {
  return input.replace(/[\/\\*<>|:*"?]/g, " ");
}
