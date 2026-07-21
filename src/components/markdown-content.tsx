import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function safeHref(href: string | undefined): string | undefined {
  if (!href) return undefined;
  const t = href.trim();
  if (/^(https?:|mailto:|\/|#)/i.test(t)) return t;
  return undefined;
}

const components: Components = {
  a({ href, children, ...props }) {
    const safe = safeHref(href);
    if (!safe) return <span>{children}</span>;
    const external = /^https?:/i.test(safe);
    return (
      <a
        href={safe}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...props}
      >
        {children}
      </a>
    );
  },
  img({ src, alt }) {
    const safe = typeof src === "string" ? safeHref(src) : undefined;
    if (!safe || !/^https?:/i.test(safe)) {
      return <span className="text-muted">[gambar tidak valid]</span>;
    }
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={safe} alt={alt || ""} loading="lazy" />;
  },
};

export function MarkdownContent({
  content,
  className = "prose-content",
}: {
  content: string;
  className?: string;
}) {
  if (!content?.trim()) return null;
  return (
    <div className={className}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components} skipHtml>
        {content}
      </ReactMarkdown>
    </div>
  );
}
