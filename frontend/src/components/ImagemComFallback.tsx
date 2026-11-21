import { useEffect, useState, type ImgHTMLAttributes } from "react";

export interface ImagemComFallbackProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> {
  src: string | null | undefined;
  fallback: string;
}

/** Troca para a imagem de reserva quando a URL está vazia ou o arquivo não existe. */
export function ImagemComFallback({ src, fallback, alt = "", ...rest }: ImagemComFallbackProps) {
  const [falhou, setFalhou] = useState(false);
  useEffect(() => setFalhou(false), [src]);
  const origem = !src || falhou ? fallback : src;
  return <img src={origem} alt={alt} loading="lazy" onError={() => setFalhou(true)} {...rest} />;
}
