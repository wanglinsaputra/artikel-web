import MailChecker from "mailchecker";

/**
 * Extra disposable domains not yet in mailchecker (or project-specific).
 * Update list here; mailchecker itself updates via `npm update mailchecker`.
 */
const EXTRA_DISPOSABLE_DOMAINS = [
  "tempmail.com",
  "throwaway.email",
];

MailChecker.addCustomDomains(EXTRA_DISPOSABLE_DOMAINS);

/** True if email domain (or parent) is a known disposable/temp provider. */
export function isDisposableEmail(email: string): boolean {
  if (typeof email !== "string") return false;
  const at = email.lastIndexOf("@");
  if (at < 0) return false;

  let domain = email.slice(at + 1).toLowerCase().trim();
  if (!domain) return false;

  const blacklist = MailChecker.blacklist();
  let nextDot: number;
  do {
    if (blacklist.has(domain)) return true;
  } while (
    (nextDot = domain.indexOf(".")) !== -1 &&
    (domain = domain.slice(nextDot + 1))
  );

  return false;
}
