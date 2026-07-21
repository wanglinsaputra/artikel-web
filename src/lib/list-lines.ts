/** One non-empty line → one list item. Strips common list prefixes. */
export function parseListLines(raw: string): string[] {
  return raw
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*(?:\d+[.)]\s*|[-*•]\s*)/, "").trim())
    .filter(Boolean);
}
