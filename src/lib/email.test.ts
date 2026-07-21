import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isDisposableEmail } from "./email";

describe("isDisposableEmail", () => {
  it("allows common providers", () => {
    assert.equal(isDisposableEmail("user@gmail.com"), false);
    assert.equal(isDisposableEmail("user@yahoo.com"), false);
    assert.equal(isDisposableEmail("user@outlook.com"), false);
  });

  it("rejects known disposable domains", () => {
    assert.equal(isDisposableEmail("a@mail.tm"), true);
    assert.equal(isDisposableEmail("a@1secmail.com"), true);
    assert.equal(isDisposableEmail("a@guerrillamail.com"), true);
    assert.equal(isDisposableEmail("a@mailinator.com"), true);
    assert.equal(isDisposableEmail("a@yopmail.com"), true);
    assert.equal(isDisposableEmail("a@temp-mail.org"), true);
  });

  it("rejects project extra domains", () => {
    assert.equal(isDisposableEmail("a@tempmail.com"), true);
    assert.equal(isDisposableEmail("a@throwaway.email"), true);
  });

  it("matches parent domain (subdomain)", () => {
    assert.equal(isDisposableEmail("a@foo.mailinator.com"), true);
  });

  it("is case-insensitive", () => {
    assert.equal(isDisposableEmail("A@Mail.TM"), true);
    assert.equal(isDisposableEmail("A@Gmail.COM"), false);
  });
});
