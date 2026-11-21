import { forwardRef, type ButtonHTMLAttributes } from "react";
import styles from "./Button.module.css";

export type VarianteBotao = "primary" | "ghost" | "danger" | "light";
export type TamanhoBotao = "normal" | "pequeno";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: VarianteBotao;
  tamanho?: TamanhoBotao;
  carregando?: boolean;
  textoCarregando?: string;
}

/** Classe pronta para usar em <Link> com a mesma aparência do botão. */
export const classeBotao = (variante: VarianteBotao = "primary", tamanho: TamanhoBotao = "normal"): string =>
  `${styles.button} ${styles[variante]} ${tamanho === "pequeno" ? styles.pequeno : ""}`;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variante = "primary", tamanho = "normal", carregando = false, textoCarregando, className, disabled, children, type = "button", ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      className={`${classeBotao(variante, tamanho)} ${className ?? ""}`}
      disabled={disabled || carregando}
      aria-busy={carregando}
      {...rest}
    >
      {carregando ? (
        <>
          <i className={styles.spinner} aria-hidden="true" /> {textoCarregando ?? "Aguarde…"}
        </>
      ) : (
        children
      )}
    </button>
  );
});
