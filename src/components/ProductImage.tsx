import React, { useState } from "react";
import { Image as ImageIcon } from "lucide-react";

interface ProductImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  containerClassName?: string;
  iconSize?: "sm" | "md" | "lg";
}

export const ProductImage: React.FC<ProductImageProps> = ({
  src,
  alt,
  className = "w-full h-full object-contain mix-blend-multiply",
  containerClassName = "w-full h-full flex items-center justify-center bg-slate-50",
  iconSize = "md",
}) => {
  const [hasError, setHasError] = useState(false);

  // If no source is provided or if it failed to load
  if (!src || hasError) {
    const iconDim =
      iconSize === "sm" ? "w-4 h-4" : iconSize === "lg" ? "w-8 h-8" : "w-5 h-5";

    return (
      <div
        className={`${containerClassName} text-slate-300 flex flex-col items-center justify-center select-none`}
        title={alt || "Product image not available"}
      >
        <ImageIcon className={`${iconDim} text-slate-300 stroke-1.5`} />
        {iconSize === "lg" && (
          <span className="text-[10px] text-slate-400 font-sans mt-1">No Image</span>
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setHasError(true)}
      referrerPolicy="no-referrer"
      loading="lazy"
      className={className}
    />
  );
};
