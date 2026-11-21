import { Link, useParams } from "react-router-dom";
import { Alert } from "../../components/Alert";
import { Button, classeBotao } from "../../components/Button";
import { FormField } from "../../components/FormField";
import { PageHeader } from "../../components/PageHeader";
import { useResourceForm } from "../../hooks/useResourceForm";
import crud from "../../styles/crud.module.css";
import { UFS, type Endereco, type EnderecoPayload, type UF } from "../../types/recursos";
import type { ErrosFormulario } from "../../utils/apiErrors";
import { maskCep } from "../../utils/format";

type EnderecoForm = Omit<EnderecoPayload, "complemento" | "uf"> & { complemento: string; uf: UF | "" };

const OBRIGATORIOS: { campo: keyof EnderecoForm; mensagem: string }[] = [
  { campo: "apelido", mensagem: "Dê um apelido (ex.: Loja, Casa)." },
  { campo: "logradouro", mensagem: "Informe o logradouro." },
  { campo: "numero", mensagem: "Informe o número (ou S/N)." },
  { campo: "bairro", mensagem: "Informe o bairro." },
  { campo: "cidade", mensagem: "Informe a cidade." }
];

const validar = (f: EnderecoForm): ErrosFormulario<EnderecoForm> => {
  const erros: ErrosFormulario<EnderecoForm> = {};
  for (const { campo, mensagem } of OBRIGATORIOS) if (!f[campo].trim()) erros[campo] = mensagem;
  if (f.cep.replace(/\D/g, "").length !== 8) erros.cep = "O CEP deve ter 8 dígitos.";
  if (!f.uf) erros.uf = "Selecione a UF.";
  return erros;
};

export function EnderecoFormPage() {
  const { id } = useParams();
  const form = useResourceForm<EnderecoForm, Endereco, EnderecoPayload>({
    endpoint: "/enderecos",
    rotaLista: "/app/enderecos",
    id,
    inicial: { apelido: "", cep: "", logradouro: "", numero: "", complemento: "", bairro: "", cidade: "", uf: "" },
    paraFormulario: (e) => ({
      apelido: e.apelido,
      cep: maskCep(e.cep),
      logradouro: e.logradouro,
      numero: e.numero,
      complemento: e.complemento ?? "",
      bairro: e.bairro,
      cidade: e.cidade,
      uf: e.uf
    }),
    paraPayload: (f) => ({
      apelido: f.apelido.trim(),
      cep: f.cep.replace(/\D/g, ""),
      logradouro: f.logradouro.trim(),
      numero: f.numero.trim(),
      complemento: f.complemento.trim() || null,
      bairro: f.bairro.trim(),
      cidade: f.cidade.trim(),
      // validar() garante que a UF foi escolhida antes de montar o payload.
      uf: f.uf || "PR"
    }),
    validar,
    mensagens: { criado: "Endereço cadastrado.", atualizado: "Endereço atualizado." }
  });
  const { valores, erros, setCampo } = form;

  return (
    <>
      <Link className={crud.voltar} to="/app/enderecos">← Voltar para endereços</Link>
      <PageHeader sobretitulo="Minha conta" titulo={form.editando ? "Editar endereço" : "Novo endereço"} />
      {form.erroCarga ? (
        <Alert tipo="erro">{form.erroCarga}</Alert>
      ) : form.carregando ? (
        <p className="carregando">Carregando…</p>
      ) : (
        <form className="painel" onSubmit={(e) => void form.enviar(e)} noValidate>
          {erros.form && <Alert tipo="erro">{erros.form}</Alert>}
          <div className="formGrid">
            <FormField label="Apelido" error={erros.apelido} obrigatorio>
              <input value={valores.apelido} onChange={(e) => setCampo("apelido", e.target.value)} maxLength={60} placeholder="Ex.: Loja Centro" aria-invalid={!!erros.apelido} />
            </FormField>
            <FormField label="CEP" error={erros.cep} obrigatorio>
              <input inputMode="numeric" value={valores.cep} onChange={(e) => setCampo("cep", maskCep(e.target.value))} placeholder="00000-000" aria-invalid={!!erros.cep} />
            </FormField>
            <div className="span2">
              <FormField label="Logradouro" error={erros.logradouro} obrigatorio>
                <input autoComplete="address-line1" value={valores.logradouro} onChange={(e) => setCampo("logradouro", e.target.value)} maxLength={150} aria-invalid={!!erros.logradouro} />
              </FormField>
            </div>
            <FormField label="Número" error={erros.numero} obrigatorio>
              <input value={valores.numero} onChange={(e) => setCampo("numero", e.target.value)} maxLength={10} aria-invalid={!!erros.numero} />
            </FormField>
            <FormField label="Complemento" error={erros.complemento}>
              <input value={valores.complemento} onChange={(e) => setCampo("complemento", e.target.value)} maxLength={80} />
            </FormField>
            <FormField label="Bairro" error={erros.bairro} obrigatorio>
              <input value={valores.bairro} onChange={(e) => setCampo("bairro", e.target.value)} maxLength={80} aria-invalid={!!erros.bairro} />
            </FormField>
            <FormField label="Cidade" error={erros.cidade} obrigatorio>
              <input autoComplete="address-level2" value={valores.cidade} onChange={(e) => setCampo("cidade", e.target.value)} maxLength={80} aria-invalid={!!erros.cidade} />
            </FormField>
            <FormField label="UF" error={erros.uf} obrigatorio>
              <select value={valores.uf} onChange={(e) => setCampo("uf", UFS.find((uf) => uf === e.target.value) ?? "")} aria-invalid={!!erros.uf}>
                <option value="">Selecione…</option>
                {UFS.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
              </select>
            </FormField>
          </div>
          <div className="formAcoes">
            <Link className={classeBotao("light")} to="/app/enderecos">Cancelar</Link>
            <Button type="submit" carregando={form.salvando} textoCarregando="Salvando…">Salvar endereço</Button>
          </div>
        </form>
      )}
    </>
  );
}
