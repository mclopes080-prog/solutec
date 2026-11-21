import type { MetaPaginacao } from "../types/api";
import styles from "./Pagination.module.css";

export interface PaginationProps {
  meta: MetaPaginacao;
  onChange: (page: number) => void;
  /** Tema para fundo escuro (catálogo público). */
  escuro?: boolean;
}

/** Janela de até 5 páginas ao redor da atual. */
const paginasVisiveis = (atual: number, total: number): number[] => {
  const inicio = Math.max(1, Math.min(atual - 2, total - 4));
  const fim = Math.min(total, inicio + 4);
  return Array.from({ length: fim - inicio + 1 }, (_, i) => inicio + i);
};

export function Pagination({ meta, onChange, escuro = false }: PaginationProps) {
  const { page, totalPages, total, limit } = meta;
  const primeiro = total === 0 ? 0 : (page - 1) * limit + 1;
  const ultimo = Math.min(page * limit, total);

  return (
    <nav className={`${styles.paginacao} ${escuro ? styles.escuro : ""}`} aria-label="Paginação">
      <span className={styles.resumo}>
        {total === 0 ? "Nenhum registro" : `${primeiro}–${ultimo} de ${total}`}
      </span>
      <div className={styles.botoes}>
        <button type="button" onClick={() => onChange(page - 1)} disabled={page <= 1} aria-label="Página anterior">‹</button>
        {paginasVisiveis(page, totalPages).map((numero) => (
          <button key={numero} type="button" onClick={() => onChange(numero)} aria-current={numero === page ? "page" : undefined} className={numero === page ? styles.atual : ""}>
            {numero}
          </button>
        ))}
        <button type="button" onClick={() => onChange(page + 1)} disabled={page >= totalPages} aria-label="Próxima página">›</button>
      </div>
    </nav>
  );
}
