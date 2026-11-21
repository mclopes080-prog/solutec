import type { ReactNode } from "react";
import styles from "./PageHeader.module.css";

export interface PageHeaderProps {
  titulo: string;
  descricao?: string;
  /** Botões/links à direita (ex.: "Novo produto"). */
  acoes?: ReactNode;
  sobretitulo?: string;
}

export function PageHeader({ titulo, descricao, acoes, sobretitulo }: PageHeaderProps) {
  return (
    <header className={styles.header}>
      <div>
        {sobretitulo && <span className={styles.eyebrow}>{sobretitulo}</span>}
        <h1>{titulo}</h1>
        {descricao && <p>{descricao}</p>}
      </div>
      {acoes && <div className={styles.acoes}>{acoes}</div>}
    </header>
  );
}
