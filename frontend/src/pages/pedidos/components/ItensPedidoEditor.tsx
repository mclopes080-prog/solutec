import { Button } from "../../../components/Button";
import type { Produto } from "../../../types/recursos";
import { formatarMoeda } from "../../../utils/format";
import styles from "./ItensPedidoEditor.module.css";

export interface LinhaItem {
  /** Chave local só para o React (a linha ainda pode não ter produto). */
  chave: string;
  produtoId: string;
  quantidade: string;
}

export const novaLinha = (produtoId = "", quantidade = "1"): LinhaItem => ({
  chave: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
  produtoId,
  quantidade
});

interface ItensPedidoEditorProps {
  linhas: LinhaItem[];
  produtos: Produto[];
  onChange: (linhas: LinhaItem[]) => void;
  erro?: string | undefined;
}

/**
 * Editor de itens do pedido. O total mostrado aqui é só uma estimativa com o preço atual:
 * quem calcula e congela o valor é o servidor.
 */
export function ItensPedidoEditor({ linhas, produtos, onChange, erro }: ItensPedidoEditorProps) {
  const porId = new Map(produtos.map((p) => [p.id, p]));
  const estimativa = linhas.reduce((soma, linha) => {
    const produto = porId.get(linha.produtoId);
    const quantidade = Number(linha.quantidade);
    return produto && Number.isInteger(quantidade) ? soma + Math.round(produto.preco * 100) * quantidade : soma;
  }, 0) / 100;

  const alterar = (chave: string, mudanca: Partial<LinhaItem>) =>
    onChange(linhas.map((linha) => (linha.chave === chave ? { ...linha, ...mudanca } : linha)));

  return (
    <fieldset className={styles.editor} aria-invalid={!!erro}>
      <legend>Itens do pedido <b aria-hidden="true">*</b></legend>
      {linhas.map((linha, indice) => {
        const usados = new Set(linhas.filter((l) => l.chave !== linha.chave).map((l) => l.produtoId));
        const produto = porId.get(linha.produtoId);
        return (
          <div key={linha.chave} className={styles.linha}>
            <label>
              <span className="visuallyHidden">Produto do item {indice + 1}</span>
              <select value={linha.produtoId} onChange={(e) => alterar(linha.chave, { produtoId: e.target.value })}>
                <option value="">Selecione um produto…</option>
                {produtos.map((p) => (
                  <option key={p.id} value={p.id} disabled={usados.has(p.id)}>
                    {p.nome} — {formatarMoeda(p.preco)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="visuallyHidden">Quantidade do item {indice + 1}</span>
              <input type="number" min={1} max={999} step={1} value={linha.quantidade} onChange={(e) => alterar(linha.chave, { quantidade: e.target.value })} />
            </label>
            <span className={styles.subtotal}>{produto ? formatarMoeda(produto.preco * Number(linha.quantidade || 0)) : "—"}</span>
            <Button variante="light" tamanho="pequeno" onClick={() => onChange(linhas.filter((l) => l.chave !== linha.chave))} disabled={linhas.length === 1} aria-label={`Remover item ${indice + 1}`}>
              ✕
            </Button>
          </div>
        );
      })}
      <div className={styles.rodape}>
        <Button variante="light" tamanho="pequeno" onClick={() => onChange([...linhas, novaLinha()])} disabled={linhas.length >= produtos.length}>
          + Adicionar item
        </Button>
        <span>Total estimado: <strong>{formatarMoeda(estimativa)}</strong></span>
      </div>
      {erro && <small role="alert" className={styles.erro}>{erro}</small>}
    </fieldset>
  );
}
