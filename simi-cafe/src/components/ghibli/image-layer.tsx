import Image from "next/image";
import { cn } from "@/lib/utils";

interface ImageLayerProps {
  src: string;
  alt: string;
  className?: string;
}

export function ImageLayer({ src, alt, className }: ImageLayerProps) {
  return (
    <div className={cn("overflow-hidden rounded-2xl shadow-xl site-card relative h-full min-h-64", className)}>
      <Image src={src} alt={alt} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
    </div>
  );
}
