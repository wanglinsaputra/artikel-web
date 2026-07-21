import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  insertWithUniqueSlug,
  isUniqueViolation,
  slugWithSuffix,
  slugify,
} from "./slug";

describe("slugify", () => {
  it("lowercases and replaces spaces", () => {
    assert.equal(slugify("Hello World"), "hello-world");
  });

  it("strips special characters", () => {
    assert.equal(slugify("C++ & AI!!!"), "c-ai");
  });

  it("collapses duplicate hyphens and trims edges", () => {
    assert.equal(slugify("  --Foo---Bar--  "), "foo-bar");
  });

  it("uses fallback when empty", () => {
    assert.equal(slugify("!!!", "untitled"), "untitled");
  });

  it("handles underscores as separators", () => {
    assert.equal(slugify("hello_world_test"), "hello-world-test");
  });
});

describe("slugWithSuffix", () => {
  it("returns base on attempt 1", () => {
    assert.equal(slugWithSuffix("hello", 1), "hello");
  });

  it("appends -2, -3, ...", () => {
    assert.equal(slugWithSuffix("hello", 2), "hello-2");
    assert.equal(slugWithSuffix("hello", 3), "hello-3");
    assert.equal(slugWithSuffix("hello", 4), "hello-4");
  });
});

describe("isUniqueViolation", () => {
  it("detects Mongo duplicate key", () => {
    assert.equal(isUniqueViolation({ code: 11000 }), true);
    assert.equal(isUniqueViolation({ codeName: "DuplicateKey" }), true);
  });

  it("detects Postgres unique_violation", () => {
    assert.equal(isUniqueViolation({ code: "23505" }), true);
  });

  it("rejects other errors", () => {
    assert.equal(isUniqueViolation({ code: 50 }), false);
    assert.equal(isUniqueViolation(null), false);
  });
});

describe("insertWithUniqueSlug", () => {
  it("uses base slug when free", async () => {
    const row = await insertWithUniqueSlug("Hello World", async (slug) => ({ slug }));
    assert.equal(row.slug, "hello-world");
  });

  it("retries -2 -3 on unique violations", async () => {
    const tried: string[] = [];
    const row = await insertWithUniqueSlug("Same", async (slug) => {
      tried.push(slug);
      if (slug === "same" || slug === "same-2") {
        const err = Object.assign(new Error("E11000 duplicate"), { code: 11000 });
        throw err;
      }
      return { slug };
    });
    assert.deepEqual(tried, ["same", "same-2", "same-3"]);
    assert.equal(row.slug, "same-3");
  });

  it("rethrows non-unique errors", async () => {
    await assert.rejects(
      () =>
        insertWithUniqueSlug("X", async () => {
          throw new Error("network down");
        }),
      /network down/
    );
  });

  it("handles concurrent-style races via constraint only", async () => {
    const taken = new Set<string>();
    async function raceInsert(slug: string) {
      if (taken.has(slug)) {
        throw Object.assign(new Error("dup"), { code: 11000 });
      }
      taken.add(slug);
      return { slug };
    }
    // pretake base
    taken.add("race");
    const a = await insertWithUniqueSlug("Race", raceInsert);
    assert.equal(a.slug, "race-2");
  });
});
