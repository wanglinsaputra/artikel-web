import Image from "next/image";

type BrandLogoProps = {
  className?: string;
  priority?: boolean;
};

/** Square WangLinS mark from /public/wanglins.webp */
export function BrandLogo({ className = "h-9 w-9", priority = false }: BrandLogoProps) {
  return (
    <Image
      src="/wanglins.webp"
      alt="WangLinS"
      width={1254}
      height={1254}
      className={className}
      priority={priority}
    />
  );
}
