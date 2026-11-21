import { Link } from "react-router-dom";
import { Alert } from "../../components/Alert";
import { classeBotao } from "../../components/Button";
import { ImagemComFallback } from "../../components/ImagemComFallback";
import { Pagination } from "../../components/Pagination";
import { useAuth } from "../../contexts/AuthContext";
import { usePaginatedList } from "../../hooks/usePaginatedList";
import type { Produto } from "../../types/recursos";
import { formatarMoeda, PLACEHOLDER_PRODUTO } from "../../utils/format";
import styles from "./CatalogoPage.module.css";

/** Vitrine pública: usa a rota aberta GET /api/catalogo (só produtos ativos). */
export function CatalogoPage() {
  const catalogo = usePaginatedList<Produto>("/catalogo", 8);
  const { autenticado } = useAuth();

  return (
    <section className={styles.page}>
      <div className="container">
        <header className={styles.cabecalho}>
          <span>Catálogo Solutec</span>
          <h1>Soluções em segurança eletrônica</h1>
          <p>Câmeras, alarmes, controle de acesso e monitoramento para residências e comércios.</p>
        </header>

        {catalogo.erro && <Alert tipo="erro">{catalogo.erro}</Alert>}

        <div className={styles.grid} aria-busy={catalogo.carregando}>
          {catalogo.carregando && catalogo.itens.length === 0
            ? Array.from({ length: 4 }, (_, i) => <div key={i} className={`${styles.card} ${styles.esqueleto}`} aria-hidden="true" />)
            : catalogo.itens.map((produto) => <CartaoProduto key={produto.id} produto={produto} />)}
        </div>

        {!catalogo.carregando && !catalogo.erro && catalogo.itens.length === 0 && (
          <p className={styles.vazio}>Nenhum produto disponível no momento.</p>
        )}

        <Pagination meta={catalogo.meta} onChange={catalogo.setPage} escuro />

        <div className={styles.cta}>
          {autenticado ? (
            <Link className={classeBotao()} to="/app/pedidos/novo">Fazer um pedido →</Link>
          ) : (
            <Link className={classeBotao()} to="/cadastro">Crie sua conta para fazer pedidos →</Link>
          )}
        </div>
      </div>
    </section>
  );
}

/** Cartão de produto exclusivo da vitrine. */
function CartaoProduto({ produto }: { produto: Produto }) {
  return (
    <article className={styles.card}>
      <ImagemComFallback className={styles.imagem} src={produto.imagemUrl} fallback={PLACEHOLDER_PRODUTO} alt={produto.nome} />
      <div className={styles.corpo}>
        {produto.categoria && <span className={styles.categoria}>{produto.categoria.nome}</span>}
        <h2>{produto.nome}</h2>
        <p>{produto.descricao}</p>
        <div className={styles.rodape}>
          <strong>{formatarMoeda(produto.preco)}</strong>
          <span className={produto.disponivel ? styles.disponivel : styles.esgotado}>
            {produto.disponivel ? "Em estoque" : "Esgotado"}
          </span>
        </div>
      </div>
    </article>
  );
}
