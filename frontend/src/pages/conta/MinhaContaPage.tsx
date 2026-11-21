import { type FormEvent, useState } from "react";
import { Alert } from "../../components/Alert";
import { Button } from "../../components/Button";
import { FormField } from "../../components/FormField";
import { PageHeader } from "../../components/PageHeader";
import { PasswordStrength } from "../../components/PasswordStrength";
import { useAuth } from "../../contexts/AuthContext";
import { useFormState } from "../../hooks/useFormState";
import { api } from "../../services/api";
import type { UsuarioPublico, UsuarioResponse } from "../../types/api";
import { errosDoFormulario, extrairErroApi, type ErrosFormulario } from "../../utils/apiErrors";
import { isValidCpf, maskCpf } from "../../utils/cpf";
import { isStrongPassword } from "../../utils/password";
import styles from "./MinhaContaPage.module.css";

/** Campos enviados no PUT /usuarios/me. O e-mail fica de fora de propósito. */
interface ContaForm {
  nome: string;
  cpf: string;
  senha: string;
  confirmacaoSenha: string;
}

const CAMPOS: (keyof ContaForm)[] = ["nome", "cpf", "senha", "confirmacaoSenha"];

function validarConta(form: ContaForm): ErrosFormulario<ContaForm> {
  const erros: ErrosFormulario<ContaForm> = {};
  if (form.nome.trim().length < 2) erros.nome = "Informe seu nome completo.";
  if (!isValidCpf(form.cpf)) erros.cpf = "Informe um CPF válido.";
  if (!isStrongPassword(form.senha)) erros.senha = "A senha precisa atender a todos os critérios.";
  if (!form.confirmacaoSenha) erros.confirmacaoSenha = "Confirme a senha.";
  else if (form.senha !== form.confirmacaoSenha) erros.confirmacaoSenha = "As senhas não coincidem.";
  return erros;
}

export function MinhaContaPage() {
  const { usuario } = useAuth();
  // ProtectedRoute garante o usuário; o fallback só satisfaz o tipo.
  return usuario ? <FormularioConta usuario={usuario} /> : null;
}

function FormularioConta({ usuario }: { usuario: UsuarioPublico }) {
  const { atualizarUsuario } = useAuth();
  const { valores, erros, setErros, setCampo, setValores } = useFormState<ContaForm>({
    nome: usuario.nome,
    cpf: maskCpf(usuario.cpf),
    senha: "",
    confirmacaoSenha: ""
  });
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState("");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSucesso("");
    const validacao = validarConta(valores);
    if (Object.keys(validacao).length) {
      setErros(validacao);
      return;
    }
    setSalvando(true);
    try {
      const { data } = await api.put<UsuarioResponse>("/usuarios/me", {
        nome: valores.nome.trim(),
        cpf: valores.cpf,
        senha: valores.senha,
        confirmacaoSenha: valores.confirmacaoSenha
      });
      atualizarUsuario(data.data.usuario);
      setValores((atual) => ({ ...atual, nome: data.data.usuario.nome, cpf: maskCpf(data.data.usuario.cpf), senha: "", confirmacaoSenha: "" }));
      setSucesso(data.message ?? "Dados atualizados com sucesso.");
    } catch (error) {
      setErros(errosDoFormulario<ContaForm>(extrairErroApi(error), CAMPOS));
    } finally {
      setSalvando(false);
    }
  };

  return (
    <>
      <PageHeader sobretitulo="Perfil" titulo="Minha conta" descricao="Atualize seus dados. Para manter a senha atual, digite-a novamente nos dois campos." />
      <div className={styles.grid}>
        <form className="painel" onSubmit={(e) => void handleSubmit(e)} noValidate>
          {sucesso && <Alert tipo="sucesso">✓ {sucesso}</Alert>}
          {erros.form && <Alert tipo="erro">{erros.form}</Alert>}
          <div className="formGrid">
            <FormField label="Nome completo" error={erros.nome} obrigatorio>
              <input autoComplete="name" value={valores.nome} onChange={(e) => setCampo("nome", e.target.value)} aria-invalid={!!erros.nome} />
            </FormField>
            <FormField label="E-mail" hint="O e-mail não pode ser alterado.">
              <input type="email" value={usuario.email} disabled readOnly aria-readonly="true" />
            </FormField>
            <FormField label="CPF" error={erros.cpf} obrigatorio>
              <input inputMode="numeric" value={valores.cpf} onChange={(e) => setCampo("cpf", maskCpf(e.target.value))} maxLength={14} aria-invalid={!!erros.cpf} />
            </FormField>
            <span aria-hidden="true" />
            <FormField label="Nova senha" error={erros.senha} obrigatorio hint={<PasswordStrength senha={valores.senha} />}>
              <input type="password" autoComplete="new-password" value={valores.senha} onChange={(e) => setCampo("senha", e.target.value)} aria-invalid={!!erros.senha} />
            </FormField>
            <FormField label="Confirme a senha" error={erros.confirmacaoSenha} obrigatorio>
              <input type="password" autoComplete="new-password" value={valores.confirmacaoSenha} onChange={(e) => setCampo("confirmacaoSenha", e.target.value)} aria-invalid={!!erros.confirmacaoSenha} />
            </FormField>
          </div>
          <div className="formAcoes">
            <Button type="submit" carregando={salvando} textoCarregando="Salvando…">Salvar alterações</Button>
          </div>
        </form>
        <ResumoConta usuario={usuario} />
      </div>
    </>
  );
}

/** Cartão lateral exclusivo desta tela. */
function ResumoConta({ usuario }: { usuario: UsuarioPublico }) {
  return (
    <aside className={`painel ${styles.resumo}`}>
      <div className={styles.avatar} aria-hidden="true">{usuario.nome.charAt(0).toUpperCase()}</div>
      <strong>{usuario.nome}</strong>
      <span>{usuario.email}</span>
      <small>Cliente desde {new Date(usuario.criadoEm).toLocaleDateString("pt-BR")}</small>
    </aside>
  );
}
