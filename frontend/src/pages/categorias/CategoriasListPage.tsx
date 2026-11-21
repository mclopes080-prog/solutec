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
import type { Categoria, CategoriaPayload } from "../../types/recursos";
import { formatarData } from "../../utils/format";
import { mensagemDaNavegacao } from "../../utils/navegacao";

const colunas: Coluna<Categoria>[] = [
  {
    chave: "nome",
    titulo: "Categoria",
    render: (c) => (
      <>
        <span className={crud.nome}>{c.nome}</span>
        {c.descricao && <span className={crud.secundario}>{c.descricao}</span>}
      </>
    )
  },
  { chave: "atualizado", titulo: "Atualizada em", render: (c) => formatarData(c.atualizadoEm) }
];

export function CategoriasListPage() {
  const location = useLocation();
  const lista = usePaginatedList<Categoria>("/categorias");
  const { remover } = useCrud<Categoria, CategoriaPayload>("/categorias");
  const exclusao = useConfirmarExclusao<Categoria>((c) => remover(c.id), lista.recarregar);
  const mensagem = mensagemDaNavegacao(location.state);

  return (
    <>
      <PageHeader
        sobretitulo="Catálogo"
        titulo="Categorias"
        descricao="Agrupe os produtos por linha: câmeras, alarmes, controle de acesso e monitoramento."
        acoes={<Link className={classeBotao()} to="/app/categorias/novo">+ Nova categoria</Link>}
      />
      <div className={crud.mensagens}>
        {mensagem && !exclusao.sucesso && !exclusao.erro && <Alert tipo="sucesso">✓ {mensagem}</Alert>}
        {exclusao.sucesso && <Alert tipo="sucesso">✓ {exclusao.sucesso}</Alert>}
        {(exclusao.erro || lista.erro) && <Alert tipo="erro">{exclusao.erro || lista.erro}</Alert>}
      </div>
      <DataTable
        legenda="Lista de categorias"
        colunas={colunas}
        itens={lista.itens}
        chaveItem={(c) => c.id}
        carregando={lista.carregando}
        vazio="Nenhuma categoria cadastrada ainda."
        acoes={(c) => (
          <>
            <Link className={classeBotao("light", "pequeno")} to={`/app/categorias/${c.id}/editar`}>Editar</Link>
            <Button variante="danger" tamanho="pequeno" onClick={() => exclusao.pedir(c)}>Excluir</Button>
          </>
        )}
      />
      <Pagination meta={lista.meta} onChange={lista.setPage} />
      <ConfirmDialog
        aberto={exclusao.alvo !== null}
        titulo="Excluir categoria?"
        mensagem={<>A categoria <strong>{exclusao.alvo?.nome}</strong> será removida. Categorias com produtos vinculados não podem ser excluídas.</>}
        carregando={exclusao.excluindo}
        onConfirmar={() => void exclusao.confirmar()}
        onCancelar={exclusao.cancelar}
      />
    </>
  );
}
