import { Link, useParams } from "react-router-dom";
import { Alert } from "../../components/Alert";
import { Button, classeBotao } from "../../components/Button";
import { FormField } from "../../components/FormField";
import { PageHeader } from "../../components/PageHeader";
import { useResourceForm } from "../../hooks/useResourceForm";
import crud from "../../styles/crud.module.css";
import type { Categoria, CategoriaPayload } from "../../types/recursos";
import type { ErrosFormulario } from "../../utils/apiErrors";

interface CategoriaForm {
  nome: string;
  descricao: string;
}

const validar = (f: CategoriaForm): ErrosFormulario<CategoriaForm> => {
  const erros: ErrosFormulario<CategoriaForm> = {};
  if (f.nome.trim().length < 2) erros.nome = "Informe o nome (mínimo 2 caracteres).";
  if (f.descricao.length > 255) erros.descricao = "Máximo de 255 caracteres.";
  return erros;
};

export function CategoriaFormPage() {
  const { id } = useParams();
  const form = useResourceForm<CategoriaForm, Categoria, CategoriaPayload>({
    endpoint: "/categorias",
    rotaLista: "/app/categorias",
    id,
    inicial: { nome: "", descricao: "" },
    paraFormulario: (c) => ({ nome: c.nome, descricao: c.descricao ?? "" }),
    paraPayload: (f) => ({ nome: f.nome.trim(), descricao: f.descricao.trim() || null }),
    validar,
    mensagens: { criado: "Categoria cadastrada.", atualizado: "Categoria atualizada." }
  });
  const { valores, erros, setCampo } = form;

  return (
    <>
      <Link className={crud.voltar} to="/app/categorias">← Voltar para categorias</Link>
      <PageHeader sobretitulo="Catálogo" titulo={form.editando ? "Editar categoria" : "Nova categoria"} />
      {form.erroCarga ? (
        <Alert tipo="erro">{form.erroCarga}</Alert>
      ) : form.carregando ? (
        <p className="carregando">Carregando…</p>
      ) : (
        <form className="painel" onSubmit={(e) => void form.enviar(e)} noValidate>
          {erros.form && <Alert tipo="erro">{erros.form}</Alert>}
          <div className="formGrid">
            <FormField label="Nome" error={erros.nome} obrigatorio>
              <input value={valores.nome} onChange={(e) => setCampo("nome", e.target.value)} maxLength={80} aria-invalid={!!erros.nome} placeholder="Ex.: Câmeras" />
            </FormField>
            <div className="span2">
              <FormField label="Descrição" error={erros.descricao} hint={`${valores.descricao.length}/255`}>
                <textarea value={valores.descricao} onChange={(e) => setCampo("descricao", e.target.value)} maxLength={255} aria-invalid={!!erros.descricao} />
              </FormField>
            </div>
          </div>
          <div className="formAcoes">
            <Link className={classeBotao("light")} to="/app/categorias">Cancelar</Link>
            <Button type="submit" carregando={form.salvando} textoCarregando="Salvando…">Salvar categoria</Button>
          </div>
        </form>
      )}
    </>
  );
}
