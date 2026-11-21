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
import type { Endereco, EnderecoPayload } from "../../types/recursos";
import { maskCep } from "../../utils/format";
import { mensagemDaNavegacao } from "../../utils/navegacao";

const colunas: Coluna<Endereco>[] = [
  { chave: "apelido", titulo: "Apelido", render: (e) => <span className={crud.nome}>{e.apelido}</span> },
  {
    chave: "logradouro",
    titulo: "Endereço",
    render: (e) => (
      <>
        {e.logradouro}, {e.numero}
        {e.complemento && ` — ${e.complemento}`}
        <span className={crud.secundario}>{e.bairro}</span>
      </>
    )
  },
  { chave: "cidade", titulo: "Cidade/UF", render: (e) => `${e.cidade}/${e.uf}` },
  { chave: "cep", titulo: "CEP", render: (e) => maskCep(e.cep) }
];

export function EnderecosListPage() {
  const location = useLocation();
  const lista = usePaginatedList<Endereco>("/enderecos");
  const { remover } = useCrud<Endereco, EnderecoPayload>("/enderecos");
  const exclusao = useConfirmarExclusao<Endereco>((e) => remover(e.id), lista.recarregar);
  const mensagem = mensagemDaNavegacao(location.state);

  return (
    <>
      <PageHeader
        sobretitulo="Minha conta"
        titulo="Endereços"
        descricao="Locais de instalação e entrega. Só você vê os seus endereços."
        acoes={<Link className={classeBotao()} to="/app/enderecos/novo">+ Novo endereço</Link>}
      />
      <div className={crud.mensagens}>
        {mensagem && !exclusao.sucesso && !exclusao.erro && <Alert tipo="sucesso">✓ {mensagem}</Alert>}
        {exclusao.sucesso && <Alert tipo="sucesso">✓ {exclusao.sucesso}</Alert>}
        {(exclusao.erro || lista.erro) && <Alert tipo="erro">{exclusao.erro || lista.erro}</Alert>}
      </div>
      <DataTable
        legenda="Lista dos seus endereços"
        colunas={colunas}
        itens={lista.itens}
        chaveItem={(e) => e.id}
        carregando={lista.carregando}
        vazio="Você ainda não cadastrou endereços."
        acoes={(e) => (
          <>
            <Link className={classeBotao("light", "pequeno")} to={`/app/enderecos/${e.id}/editar`}>Editar</Link>
            <Button variante="danger" tamanho="pequeno" onClick={() => exclusao.pedir(e)}>Excluir</Button>
          </>
        )}
      />
      <Pagination meta={lista.meta} onChange={lista.setPage} />
      <ConfirmDialog
        aberto={exclusao.alvo !== null}
        titulo="Excluir endereço?"
        mensagem={<>O endereço <strong>{exclusao.alvo?.apelido}</strong> será removido. Endereços usados em pedidos não podem ser excluídos.</>}
        carregando={exclusao.excluindo}
        onConfirmar={() => void exclusao.confirmar()}
        onCancelar={exclusao.cancelar}
      />
    </>
  );
}
