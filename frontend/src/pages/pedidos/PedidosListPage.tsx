import { Link, useLocation } from "react-router-dom";
import { Alert } from "../../components/Alert";
import { Button, classeBotao } from "../../components/Button";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { DataTable, type Coluna } from "../../components/DataTable";
import { PageHeader } from "../../components/PageHeader";
import { Pagination } from "../../components/Pagination";
import { useConfirmarExclusao } from "../../hooks/useConfirmarExclusao";
import { useCrud } from "../../hooks/useCrud";
import { usePaginatedList } from "../../hooks/usePaginatedList";
import crud from "../../styles/crud.module.css";
import type { AtualizarPedidoPayload, CriarPedidoPayload, Pedido } from "../../types/recursos";
import { codigoCurto, formatarData, formatarMoeda } from "../../utils/format";
import { mensagemDaNavegacao } from "../../utils/navegacao";
import { StatusBadge } from "./components/StatusBadge";

const colunas: Coluna<Pedido>[] = [
  {
    chave: "codigo",
    titulo: "Pedido",
    render: (p) => (
      <>
        <span className={crud.nome}>{codigoCurto(p.id)}</span>
        <span className={crud.secundario}>{formatarData(p.criadoEm)}</span>
      </>
    )
  },
  { chave: "endereco", titulo: "Entrega", render: (p) => p.endereco?.apelido ?? "—" },
  { chave: "itens", titulo: "Itens", alinhar: "direita", render: (p) => `${p.quantidadeItens} un.` },
  { chave: "total", titulo: "Total", alinhar: "direita", render: (p) => <strong>{formatarMoeda(p.total)}</strong> },
  { chave: "status", titulo: "Status", alinhar: "centro", render: (p) => <StatusBadge status={p.status} /> }
];

/** Só PENDENTE e CANCELADO podem ser excluídos (mesma regra do backend). */
const podeExcluir = (p: Pedido): boolean => p.status === "PENDENTE" || p.status === "CANCELADO";

export function PedidosListPage() {
  const location = useLocation();
  const lista = usePaginatedList<Pedido>("/pedidos");
  const { remover } = useCrud<Pedido, CriarPedidoPayload, AtualizarPedidoPayload>("/pedidos");
  const exclusao = useConfirmarExclusao<Pedido>((p) => remover(p.id), lista.recarregar);
  const mensagem = mensagemDaNavegacao(location.state);

  return (
    <>
      <PageHeader
        sobretitulo="Vendas"
        titulo="Pedidos"
        descricao="Acompanhe cada pedido do status pendente ao enviado. O total é calculado pelo servidor."
        acoes={<Link className={classeBotao()} to="/app/pedidos/novo">+ Novo pedido</Link>}
      />
      <div className={crud.mensagens}>
        {mensagem && !exclusao.sucesso && !exclusao.erro && <Alert tipo="sucesso">✓ {mensagem}</Alert>}
        {exclusao.sucesso && <Alert tipo="sucesso">✓ {exclusao.sucesso}</Alert>}
        {(exclusao.erro || lista.erro) && <Alert tipo="erro">{exclusao.erro || lista.erro}</Alert>}
      </div>
      <DataTable
        legenda="Lista dos seus pedidos"
        colunas={colunas}
        itens={lista.itens}
        chaveItem={(p) => p.id}
        carregando={lista.carregando}
        vazio="Nenhum pedido ainda."
        acoes={(p) => (
          <>
            <Link className={classeBotao("light", "pequeno")} to={`/app/pedidos/${p.id}/editar`}>{p.podeEditar || p.proximosStatus.length ? "Editar" : "Ver"}</Link>
            {podeExcluir(p) && <Button variante="danger" tamanho="pequeno" onClick={() => exclusao.pedir(p)}>Excluir</Button>}
          </>
        )}
      />
      <Pagination meta={lista.meta} onChange={lista.setPage} />
      <ConfirmDialog
        aberto={exclusao.alvo !== null}
        titulo="Excluir pedido?"
        mensagem={<>O pedido <strong>{exclusao.alvo ? codigoCurto(exclusao.alvo.id) : ""}</strong> e seus itens serão removidos.</>}
        carregando={exclusao.excluindo}
        onConfirmar={() => void exclusao.confirmar()}
        onCancelar={exclusao.cancelar}
      />
    </>
  );
}
