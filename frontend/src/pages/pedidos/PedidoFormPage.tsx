import { Link, useParams } from "react-router-dom";
import { Alert } from "../../components/Alert";
import { Button, classeBotao } from "../../components/Button";
import { DataTable, type Coluna } from "../../components/DataTable";
import { FormField } from "../../components/FormField";
import { PageHeader } from "../../components/PageHeader";
import { usePaginatedList } from "../../hooks/usePaginatedList";
import { useResourceForm } from "../../hooks/useResourceForm";
import crud from "../../styles/crud.module.css";
import {
  ROTULO_STATUS,
  STATUS_PEDIDO,
  type AtualizarPedidoPayload,
  type CriarPedidoPayload,
  type Endereco,
  type ItemPedido,
  type Pedido,
  type Produto,
  type StatusPedido
} from "../../types/recursos";
import type { ErrosFormulario } from "../../utils/apiErrors";
import { codigoCurto, formatarMoeda } from "../../utils/format";
import { ItensPedidoEditor, novaLinha, type LinhaItem } from "./components/ItensPedidoEditor";
import { StatusBadge } from "./components/StatusBadge";

interface PedidoForm {
  enderecoId: string;
  itens: LinhaItem[];
  status: StatusPedido;
}

type PedidoPayload = CriarPedidoPayload | AtualizarPedidoPayload;

const validar = (f: PedidoForm): ErrosFormulario<PedidoForm> => {
  const erros: ErrosFormulario<PedidoForm> = {};
  if (!f.enderecoId) erros.enderecoId = "Selecione o endereço de entrega.";
  if (f.itens.length === 0 || f.itens.some((i) => !i.produtoId)) erros.itens = "Escolha o produto de cada item.";
  else if (f.itens.some((i) => !/^\d+$/.test(i.quantidade) || Number(i.quantidade) < 1 || Number(i.quantidade) > 999)) {
    erros.itens = "Cada quantidade deve ser um inteiro entre 1 e 999.";
  }
  return erros;
};

const itensPayload = (linhas: LinhaItem[]) => linhas.map((l) => ({ produtoId: l.produtoId, quantidade: Number(l.quantidade) }));

/** Criação manda endereço + itens; edição manda só o que pode mudar no status atual. */
const paraPayload = (f: PedidoForm, pedido: Pedido | null): PedidoPayload => {
  if (!pedido) return { enderecoId: f.enderecoId, itens: itensPayload(f.itens) };
  const payload: AtualizarPedidoPayload = {};
  if (pedido.podeEditar) {
    payload.enderecoId = f.enderecoId;
    payload.itens = itensPayload(f.itens);
  }
  if (f.status !== pedido.status) payload.status = f.status;
  return payload;
};

const colunasItens: Coluna<ItemPedido>[] = [
  { chave: "produto", titulo: "Produto", render: (i) => i.produtoNome ?? i.produtoId },
  { chave: "qtd", titulo: "Qtd.", alinhar: "direita", render: (i) => i.quantidade },
  { chave: "preco", titulo: "Preço congelado", alinhar: "direita", render: (i) => formatarMoeda(i.precoUnitario) },
  { chave: "subtotal", titulo: "Subtotal", alinhar: "direita", render: (i) => formatarMoeda(i.subtotal) }
];

export function PedidoFormPage() {
  const { id } = useParams();
  const enderecos = usePaginatedList<Endereco>("/enderecos", 100);
  const produtos = usePaginatedList<Produto>("/produtos", 100);
  const produtosAtivos = produtos.itens.filter((p) => p.ativo);

  const form = useResourceForm<PedidoForm, Pedido, PedidoPayload>({
    endpoint: "/pedidos",
    rotaLista: "/app/pedidos",
    id,
    inicial: { enderecoId: "", itens: [novaLinha()], status: "PENDENTE" },
    paraFormulario: (p) => ({
      enderecoId: p.enderecoId,
      itens: p.itens.map((i) => novaLinha(i.produtoId, String(i.quantidade))),
      status: p.status
    }),
    paraPayload,
    validar,
    mensagens: { criado: "Pedido criado.", atualizado: "Pedido atualizado." }
  });
  const { valores, erros, setCampo, registro: pedido } = form;
  const editavel = !pedido || pedido.podeEditar;
  const opcoesStatus = pedido ? STATUS_PEDIDO.filter((s) => s === pedido.status || pedido.proximosStatus.includes(s)) : [];

  return (
    <>
      <Link className={crud.voltar} to="/app/pedidos">← Voltar para pedidos</Link>
      <PageHeader
        sobretitulo="Vendas"
        titulo={pedido ? `Pedido ${codigoCurto(pedido.id)}` : "Novo pedido"}
        descricao={pedido ? undefined : "Escolha o endereço e os produtos. O preço é congelado no momento do pedido."}
        acoes={pedido && <StatusBadge status={pedido.status} />}
      />
      {form.erroCarga ? (
        <Alert tipo="erro">{form.erroCarga}</Alert>
      ) : form.carregando ? (
        <p className="carregando">Carregando…</p>
      ) : (
        <form className="painel" onSubmit={(e) => void form.enviar(e)} noValidate>
          {erros.form && <Alert tipo="erro">{erros.form}</Alert>}
          {!enderecos.carregando && enderecos.itens.length === 0 && (
            <Alert tipo="info">Você precisa de um endereço para criar pedidos. <Link to="/app/enderecos/novo">Cadastrar endereço →</Link></Alert>
          )}
          <div className="formGrid">
            <FormField label="Endereço de entrega" error={erros.enderecoId} obrigatorio={editavel}>
              <select value={valores.enderecoId} onChange={(e) => setCampo("enderecoId", e.target.value)} disabled={!editavel} aria-invalid={!!erros.enderecoId}>
                <option value="">Selecione…</option>
                {enderecos.itens.map((e) => <option key={e.id} value={e.id}>{e.apelido} — {e.cidade}/{e.uf}</option>)}
              </select>
            </FormField>
            {pedido && (
              <FormField label="Status" error={erros.status} hint={opcoesStatus.length === 1 ? "Este status é final." : "Só aparecem as transições permitidas."}>
                <select value={valores.status} onChange={(e) => setCampo("status", STATUS_PEDIDO.find((s) => s === e.target.value) ?? valores.status)} disabled={opcoesStatus.length <= 1}>
                  {opcoesStatus.map((s) => <option key={s} value={s}>{ROTULO_STATUS[s]}</option>)}
                </select>
              </FormField>
            )}
            <div className="span2">
              {editavel ? (
                <ItensPedidoEditor linhas={valores.itens} produtos={produtosAtivos} onChange={(linhas) => setCampo("itens", linhas)} erro={erros.itens} />
              ) : (
                pedido && <ItensCongelados pedido={pedido} />
              )}
            </div>
          </div>
          <div className="formAcoes">
            <Link className={classeBotao("light")} to="/app/pedidos">Cancelar</Link>
            <Button type="submit" carregando={form.salvando} textoCarregando="Salvando…" disabled={!!pedido && !editavel && opcoesStatus.length <= 1}>
              {pedido ? "Salvar pedido" : "Criar pedido"}
            </Button>
          </div>
        </form>
      )}
    </>
  );
}

/** Itens somente leitura, para pedidos que já saíram de PENDENTE. */
function ItensCongelados({ pedido }: { pedido: Pedido }) {
  return (
    <>
      <p className={crud.secundario}>Pedido {pedido.status.toLowerCase()}: itens e endereço não podem mais ser alterados.</p>
      <DataTable legenda="Itens do pedido" colunas={colunasItens} itens={pedido.itens} chaveItem={(i) => i.produtoId} />
      <p style={{ marginTop: ".8rem", textAlign: "right", color: "#0b2038" }}>
        Total: <strong>{formatarMoeda(pedido.total)}</strong>
      </p>
    </>
  );
}
