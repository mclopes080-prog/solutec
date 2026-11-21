import type { ReactNode } from "react";
import styles from "./DataTable.module.css";

export interface Coluna<T> {
  chave: string;
  titulo: string;
  render: (item: T) => ReactNode;
  alinhar?: "esquerda" | "direita" | "centro";
}

export interface DataTableProps<T> {
  /** Texto para leitores de tela (caption). */
  legenda: string;
  colunas: readonly Coluna<T>[];
  itens: readonly T[];
  chaveItem: (item: T) => string;
  carregando?: boolean;
  vazio?: ReactNode;
  acoes?: (item: T) => ReactNode;
}

/** Tabela genérica: o tipo da linha (`T`) define o que cada coluna pode renderizar. */
export function DataTable<T>({ legenda, colunas, itens, chaveItem, carregando = false, vazio = "Nenhum registro encontrado.", acoes }: DataTableProps<T>) {
  const totalColunas = colunas.length + (acoes ? 1 : 0);
  return (
    <div className={styles.wrap}>
      <table className={styles.tabela} aria-busy={carregando}>
        <caption className="visuallyHidden">{legenda}</caption>
        <thead>
          <tr>
            {colunas.map((coluna) => (
              <th key={coluna.chave} scope="col" className={styles[coluna.alinhar ?? "esquerda"]}>{coluna.titulo}</th>
            ))}
            {acoes && <th scope="col" className={styles.direita}>Ações</th>}
          </tr>
        </thead>
        <tbody>
          {carregando && itens.length === 0 && (
            <tr><td colSpan={totalColunas} className={styles.estado}>Carregando…</td></tr>
          )}
          {!carregando && itens.length === 0 && (
            <tr><td colSpan={totalColunas} className={styles.estado}>{vazio}</td></tr>
          )}
          {itens.map((item) => (
            <tr key={chaveItem(item)} className={carregando ? styles.atualizando : ""}>
              {colunas.map((coluna) => (
                <td key={coluna.chave} data-titulo={coluna.titulo} className={styles[coluna.alinhar ?? "esquerda"]}>
                  <div className={styles.valor}>{coluna.render(item)}</div>
                </td>
              ))}
              {acoes && <td className={`${styles.direita} ${styles.acoes}`}>{acoes(item)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
