export function CoverImage({
  src,
  alt,
  className = "h-40 w-full object-cover",
}: {
  src?: string | null;
  alt: string;
  className?: string;
}) {
  if (!src) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className={`rounded-xl border border-border bg-base ${className}`} />
  );
}
