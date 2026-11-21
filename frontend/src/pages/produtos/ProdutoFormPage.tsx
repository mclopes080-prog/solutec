import { Link, useParams } from "react-router-dom";
import { Alert } from "../../components/Alert";
import { Button, classeBotao } from "../../components/Button";
import { FormField } from "../../components/FormField";
import { ImagemComFallback } from "../../components/ImagemComFallback";
import { PageHeader } from "../../components/PageHeader";
import { usePaginatedList } from "../../hooks/usePaginatedList";
import { useResourceForm } from "../../hooks/useResourceForm";
import crud from "../../styles/crud.module.css";
import type { Categoria, Produto, ProdutoPayload } from "../../types/recursos";
import type { ErrosFormulario } from "../../utils/apiErrors";
import { PLACEHOLDER_PRODUTO } from "../../utils/format";

/** Números ficam como texto no formulário e só viram number no payload. */
interface ProdutoForm {
  nome: string;
  descricao: string;
  preco: string;
  estoque: string;
  categoriaId: string;
  imagemUrl: string;
  ativo: boolean;
}

const paraNumero = (valor: string): number => Number(valor.replace(",", "."));

const validar = (f: ProdutoForm): ErrosFormulario<ProdutoForm> => {
  const erros: ErrosFormulario<ProdutoForm> = {};
  if (f.nome.trim().length < 2) erros.nome = "Informe o nome do produto.";
  if (!f.descricao.trim()) erros.descricao = "Informe a descrição.";
  const preco = paraNumero(f.preco);
  if (!f.preco.trim() || !Number.isFinite(preco) || preco <= 0) erros.preco = "Informe um preço maior que zero.";
  else if (!/^\d+([.,]\d{1,2})?$/.test(f.preco.trim())) erros.preco = "Use no máximo 2 casas decimais.";
  const estoque = Number(f.estoque);
  if (!f.estoque.trim() || !Number.isInteger(estoque) || estoque < 0) erros.estoque = "Informe um estoque inteiro (0 ou mais).";
  if (!f.categoriaId) erros.categoriaId = "Selecione a categoria.";
  if (f.imagemUrl.trim() && !/^(\/|https?:\/\/)\S+$/.test(f.imagemUrl.trim())) erros.imagemUrl = "Use um caminho iniciado por / ou uma URL http(s).";
  return erros;
};

export function ProdutoFormPage() {
  const { id } = useParams();
  const categorias = usePaginatedList<Categoria>("/categorias", 100);
  const form = useResourceForm<ProdutoForm, Produto, ProdutoPayload>({
    endpoint: "/produtos",
    rotaLista: "/app/produtos",
    id,
    inicial: { nome: "", descricao: "", preco: "", estoque: "0", categoriaId: "", imagemUrl: "", ativo: true },
    paraFormulario: (p) => ({
      nome: p.nome,
      descricao: p.descricao,
      preco: p.preco.toFixed(2),
      estoque: String(p.estoque),
      categoriaId: p.categoriaId,
      imagemUrl: p.imagemUrl ?? "",
      ativo: p.ativo
    }),
    paraPayload: (f) => ({
      nome: f.nome.trim(),
      descricao: f.descricao.trim(),
      preco: paraNumero(f.preco),
      estoque: Number(f.estoque),
      categoriaId: f.categoriaId,
      imagemUrl: f.imagemUrl.trim() || null,
      ativo: f.ativo
    }),
    validar,
    mensagens: { criado: "Produto cadastrado.", atualizado: "Produto atualizado." }
  });
  const { valores, erros, setCampo } = form;

  return (
    <>
      <Link className={crud.voltar} to="/app/produtos">← Voltar para produtos</Link>
      <PageHeader sobretitulo="Catálogo" titulo={form.editando ? "Editar produto" : "Novo produto"} />
      {form.erroCarga ? (
        <Alert tipo="erro">{form.erroCarga}</Alert>
      ) : form.carregando ? (
        <p className="carregando">Carregando…</p>
      ) : (
        <form className="painel" onSubmit={(e) => void form.enviar(e)} noValidate>
          {erros.form && <Alert tipo="erro">{erros.form}</Alert>}
          {!categorias.carregando && categorias.itens.length === 0 && (
            <Alert tipo="info">Cadastre uma categoria antes de criar produtos. <Link to="/app/categorias/novo">Nova categoria →</Link></Alert>
          )}
          <div className="formGrid">
            <FormField label="Nome" error={erros.nome} obrigatorio>
              <input value={valores.nome} onChange={(e) => setCampo("nome", e.target.value)} maxLength={120} aria-invalid={!!erros.nome} />
            </FormField>
            <FormField label="Categoria" error={erros.categoriaId} obrigatorio>
              <select value={valores.categoriaId} onChange={(e) => setCampo("categoriaId", e.target.value)} aria-invalid={!!erros.categoriaId}>
                <option value="">Selecione…</option>
                {categorias.itens.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </FormField>
            <div className="span2">
              <FormField label="Descrição" error={erros.descricao} obrigatorio>
                <textarea value={valores.descricao} onChange={(e) => setCampo("descricao", e.target.value)} maxLength={2000} aria-invalid={!!erros.descricao} />
              </FormField>
            </div>
            <FormField label="Preço (R$)" error={erros.preco} obrigatorio>
              <input inputMode="decimal" value={valores.preco} onChange={(e) => setCampo("preco", e.target.value)} placeholder="0,00" aria-invalid={!!erros.preco} />
            </FormField>
            <FormField label="Estoque (unidades)" error={erros.estoque} obrigatorio>
              <input type="number" min={0} step={1} value={valores.estoque} onChange={(e) => setCampo("estoque", e.target.value)} aria-invalid={!!erros.estoque} />
            </FormField>
            <FormField label="Imagem (caminho ou URL)" error={erros.imagemUrl} hint="Ex.: /img/produtos/camera-dome.webp. Sem imagem, o site mostra um marcador.">
              <input value={valores.imagemUrl} onChange={(e) => setCampo("imagemUrl", e.target.value)} maxLength={255} aria-invalid={!!erros.imagemUrl} />
            </FormField>
            <ImagemComFallback className={crud.preview} src={valores.imagemUrl.trim() || null} fallback={PLACEHOLDER_PRODUTO} alt="Pré-visualização da imagem" />
            <FormField label="Produto ativo (aparece no catálogo e pode ser pedido)" inline>
              <input type="checkbox" checked={valores.ativo} onChange={(e) => setCampo("ativo", e.target.checked)} />
            </FormField>
          </div>
          <div className="formAcoes">
            <Link className={classeBotao("light")} to="/app/produtos">Cancelar</Link>
            <Button type="submit" carregando={form.salvando} textoCarregando="Salvando…">Salvar produto</Button>
          </div>
        </form>
      )}
    </>
  );
}
