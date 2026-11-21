import { type FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { Alert } from "../components/Alert";
import { Button } from "../components/Button";
import { FormField } from "../components/FormField";
import { PasswordStrength } from "../components/PasswordStrength";
import { maskCpf } from "../utils/cpf";
import styles from "./Auth.module.css";
import { useCadastroForm } from "../hooks/useCadastroForm";

export function CadastroPage() {
  const { form, errors, loading, success, setField, submit } = useCadastroForm();
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    void submit();
  };

  return (
    <section className={styles.page}>
      <div className={`${styles.grid} container`}>
        <IntroCadastro />
        <div className={styles.card}>
          <header>
            <span>PASSO 01</span>
            <h2>Dados de acesso</h2>
            <p>Preencha os campos abaixo para começar.</p>
          </header>
          {success && <Alert tipo="sucesso">✓ {success} Redirecionando…</Alert>}
          {errors.form && <Alert tipo="erro">{errors.form}</Alert>}
          <form onSubmit={handleSubmit} noValidate>
            <FormField label="Nome completo" error={errors.nome} obrigatorio>
              <input autoComplete="name" value={form.nome} onChange={(e) => setField("nome", e.target.value)} placeholder="Como devemos chamar você?" aria-invalid={!!errors.nome} />
            </FormField>
            <div className={styles.row}>
              <FormField label="E-mail" error={errors.email} obrigatorio>
                <input type="email" autoComplete="email" value={form.email} onChange={(e) => setField("email", e.target.value)} placeholder="voce@exemplo.com" aria-invalid={!!errors.email} />
              </FormField>
              <FormField label="CPF" error={errors.cpf} obrigatorio>
                <input inputMode="numeric" autoComplete="off" value={form.cpf} onChange={(e) => setField("cpf", maskCpf(e.target.value))} placeholder="000.000.000-00" maxLength={14} aria-invalid={!!errors.cpf} />
              </FormField>
            </div>
            <FormField label="Senha" error={errors.senha} obrigatorio hint={<PasswordStrength senha={form.senha} />}>
              <div className={styles.passwordWrap}>
                <input type={mostrarSenha ? "text" : "password"} autoComplete="new-password" value={form.senha} onChange={(e) => setField("senha", e.target.value)} placeholder="Crie uma senha forte" aria-invalid={!!errors.senha} />
                <button type="button" onClick={() => setMostrarSenha((v) => !v)} aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}>
                  {mostrarSenha ? "Ocultar" : "Mostrar"}
                </button>
              </div>
            </FormField>
            <FormField label="Confirme sua senha" error={errors.confirmacaoSenha} obrigatorio>
              <input type={mostrarSenha ? "text" : "password"} autoComplete="new-password" value={form.confirmacaoSenha} onChange={(e) => setField("confirmacaoSenha", e.target.value)} placeholder="Digite a senha novamente" aria-invalid={!!errors.confirmacaoSenha} />
            </FormField>
            <Button type="submit" className={styles.submit} carregando={loading} textoCarregando="Cadastrando…" disabled={!!success}>
              Criar minha conta →
            </Button>
          </form>
          <p className={styles.rodape}>
            Já possui uma conta? <Link to="/login">Acesse aqui</Link>
          </p>
        </div>
      </div>
    </section>
  );
}

/** Bloco institucional exclusivo desta tela. */
function IntroCadastro() {
  return (
    <aside className={styles.intro}>
      <span className={styles.eyebrow}>Área do cliente</span>
      <h1>Crie sua conta<br />na <em>Solutec.</em></h1>
      <p>Cadastre-se para acompanhar pedidos, endereços e o catálogo de soluções em segurança eletrônica.</p>
      <ul>
        <li><span>✓</span><div><strong>Dados protegidos</strong><small>Senhas armazenadas com hash seguro.</small></div></li>
        <li><span>✓</span><div><strong>Cadastro rápido</strong><small>Uma experiência clara e objetiva.</small></div></li>
        <li><span>✓</span><div><strong>Painel completo</strong><small>Produtos, categorias, endereços e pedidos.</small></div></li>
      </ul>
    </aside>
  );
}
