import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseListLines } from "./list-lines";

describe("parseListLines", () => {
  it("splits non-empty lines", () => {
    assert.deepEqual(parseListLines("a\nb\n\nc"), ["a", "b", "c"]);
  });

  it("strips numbered and bullet prefixes", () => {
    assert.deepEqual(parseListLines("1. Satu\n2) Dua\n- Tiga\n* Empat\n• Lima"), [
      "Satu",
      "Dua",
      "Tiga",
      "Empat",
      "Lima",
    ]);
  });

  it("returns empty for blank input", () => {
    assert.deepEqual(parseListLines("  \n\n"), []);
  });
});
