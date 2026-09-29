"use client";
import { usePhotoUrl } from "@/lib/photoStore";

type Props = Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> & { photo?: string; fallback?: React.ReactNode };

/** <img> for a stored photo reference. Shows `fallback` while loading or when there is no photo. */
export default function Photo({ photo, fallback = null, alt = "", ...rest }: Props) {
  const url = usePhotoUrl(photo);
  if (!url) return <>{fallback}</>;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt={alt} {...rest} />;
}
