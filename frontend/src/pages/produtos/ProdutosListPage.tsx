import { Link, useLocation } from "react-router-dom";
import { Alert } from "../../components/Alert";
import { Button, classeBotao } from "../../components/Button";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { DataTable, type Coluna } from "../../components/DataTable";
import { ImagemComFallback } from "../../components/ImagemComFallback";
import { PageHeader } from "../../components/PageHeader";
import { Pagination } from "../../components/Pagination";
import { useConfirmarExclusao } from "../../hooks/useConfirmarExclusao";
import { useCrud } from "../../hooks/useCrud";
import { usePaginatedList } from "../../hooks/usePaginatedList";
import crud from "../../styles/crud.module.css";
import type { Produto, ProdutoPayload } from "../../types/recursos";
import { formatarMoeda, PLACEHOLDER_PRODUTO } from "../../utils/format";
import { mensagemDaNavegacao } from "../../utils/navegacao";

const colunas: Coluna<Produto>[] = [
  { chave: "foto", titulo: "Foto", render: (p) => <ImagemComFallback className={crud.miniatura} src={p.imagemUrl} fallback={PLACEHOLDER_PRODUTO} alt="" /> },
  {
    chave: "nome",
    titulo: "Produto",
    render: (p) => (
      <>
        <span className={crud.nome}>{p.nome}</span>
        <span className={crud.secundario}>{p.categoria?.nome ?? "Sem categoria"}</span>
      </>
    )
  },
  { chave: "preco", titulo: "Preço", alinhar: "direita", render: (p) => formatarMoeda(p.preco) },
  { chave: "estoque", titulo: "Estoque", alinhar: "direita", render: (p) => <SituacaoEstoque estoque={p.estoque} /> },
  {
    chave: "ativo",
    titulo: "Status",
    alinhar: "centro",
    render: (p) => <span className={`${crud.badge} ${p.ativo ? crud.ok : crud.neutro}`}>{p.ativo ? "Ativo" : "Inativo"}</span>
  }
];

/** Destaca estoque baixo (≤ 5) para o gestor repor a tempo. */
function SituacaoEstoque({ estoque }: { estoque: number }) {
  if (estoque === 0) return <span className={`${crud.badge} ${crud.perigo}`}>Esgotado</span>;
  if (estoque <= 5) return <span className={`${crud.badge} ${crud.alerta}`}>{estoque} un. · baixo</span>;
  return <>{estoque} un.</>;
}

export function ProdutosListPage() {
  const location = useLocation();
  const lista = usePaginatedList<Produto>("/produtos");
  const { remover } = useCrud<Produto, ProdutoPayload>("/produtos");
  const exclusao = useConfirmarExclusao<Produto>((p) => remover(p.id), lista.recarregar);
  const mensagem = mensagemDaNavegacao(location.state);

  return (
    <>
      <PageHeader
        sobretitulo="Catálogo"
        titulo="Produtos"
        descricao="Preço, estoque e disponibilidade de cada item vendido pela Solutec."
        acoes={<Link className={classeBotao()} to="/app/produtos/novo">+ Novo produto</Link>}
      />
      <div className={crud.mensagens}>
        {mensagem && !exclusao.sucesso && !exclusao.erro && <Alert tipo="sucesso">✓ {mensagem}</Alert>}
        {exclusao.sucesso && <Alert tipo="sucesso">✓ {exclusao.sucesso}</Alert>}
        {(exclusao.erro || lista.erro) && <Alert tipo="erro">{exclusao.erro || lista.erro}</Alert>}
      </div>
      <DataTable
        legenda="Lista de produtos"
        colunas={colunas}
        itens={lista.itens}
        chaveItem={(p) => p.id}
        carregando={lista.carregando}
        vazio="Nenhum produto cadastrado. Rode o seed ou cadastre o primeiro."
        acoes={(p) => (
          <>
            <Link className={classeBotao("light", "pequeno")} to={`/app/produtos/${p.id}/editar`}>Editar</Link>
            <Button variante="danger" tamanho="pequeno" onClick={() => exclusao.pedir(p)}>Excluir</Button>
          </>
        )}
      />
      <Pagination meta={lista.meta} onChange={lista.setPage} />
      <ConfirmDialog
        aberto={exclusao.alvo !== null}
        titulo="Excluir produto?"
        mensagem={<>O produto <strong>{exclusao.alvo?.nome}</strong> será removido. Se ele já estiver em algum pedido, a exclusão é bloqueada; nesse caso, desative-o.</>}
        carregando={exclusao.excluindo}
        onConfirmar={() => void exclusao.confirmar()}
        onCancelar={exclusao.cancelar}
      />
    </>
  );
}
