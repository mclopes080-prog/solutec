import { type FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { useCadastroForm } from "../hooks/useCadastroForm";
import { maskCpf } from "../utils/cpf";
import { getPasswordCriteria } from "../utils/password";
import styles from "./CadastroPage.module.css";

export function CadastroPage() {
  const { form, errors, loading, success, setField, submit } = useCadastroForm();
  const [showPassword, setShowPassword] = useState(false);
  const criteria = getPasswordCriteria(form.senha);
  const strength = Object.values(criteria).filter(Boolean).length;

  const handleSubmit = (event: FormEvent) => { event.preventDefault(); void submit(); };
  return (
    <section className={styles.page}>
      <div className={`${styles.grid} container`}>
        <aside className={styles.intro}>
          <span className={styles.eyebrow}>Área do cliente</span>
          <h1>Crie sua conta<br />na <em>Solutec.</em></h1>
          <p>Cadastre-se para preparar sua experiência na plataforma de soluções em segurança eletrônica.</p>
          <ul>
            <li><span>✓</span><div><strong>Dados protegidos</strong><small>Senhas armazenadas com hash seguro.</small></div></li>
            <li><span>✓</span><div><strong>Cadastro rápido</strong><small>Uma experiência clara e objetiva.</small></div></li>
            <li><span>✓</span><div><strong>Pronto para evoluir</strong><small>Novos recursos nas próximas sprints.</small></div></li>
          </ul>
        </aside>

        <div className={styles.card}>
          <header><span>PASSO 01</span><h2>Dados de acesso</h2><p>Preencha os campos abaixo para começar.</p></header>
          {success && <div className={styles.success} role="status">✓ {success} Redirecionando…</div>}
          {errors.form && <div className={styles.formError} role="alert">{errors.form}</div>}
          <form onSubmit={handleSubmit} noValidate>
            <Field label="Nome completo" error={errors.nome}>
              <input autoComplete="name" value={form.nome} onChange={(e) => setField("nome", e.target.value)} placeholder="Como devemos chamar você?" aria-invalid={!!errors.nome} />
            </Field>
            <div className={styles.row}>
              <Field label="E-mail" error={errors.email}>
                <input type="email" autoComplete="email" value={form.email} onChange={(e) => setField("email", e.target.value)} placeholder="voce@exemplo.com" aria-invalid={!!errors.email} />
              </Field>
              <Field label="CPF" error={errors.cpf}>
                <input inputMode="numeric" autoComplete="off" value={form.cpf} onChange={(e) => setField("cpf", maskCpf(e.target.value))} placeholder="000.000.000-00" maxLength={14} aria-invalid={!!errors.cpf} />
              </Field>
            </div>
            <Field label="Senha" error={errors.senha}>
              <div className={styles.passwordWrap}>
                <input type={showPassword ? "text" : "password"} autoComplete="new-password" value={form.senha} onChange={(e) => setField("senha", e.target.value)} placeholder="Crie uma senha forte" aria-invalid={!!errors.senha} />
                <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}>{showPassword ? "Ocultar" : "Mostrar"}</button>
              </div>
              <div className={styles.strength} aria-label={`Força da senha: ${strength} de 5`}>
                <div>{[1,2,3,4,5].map((item) => <i key={item} className={item <= strength ? styles.filled : ""} />)}</div>
                <span>{strength < 3 ? "Senha fraca" : strength < 5 ? "Senha média" : "Senha forte"}</span>
              </div>
              <ul className={styles.criteria}>{Object.entries(criteria).map(([label, valid]) => <li className={valid ? styles.valid : ""} key={label}>{valid ? "✓" : "○"} {label}</li>)}</ul>
            </Field>
            <Field label="Confirme sua senha" error={errors.confirmacaoSenha}>
              <input type={showPassword ? "text" : "password"} autoComplete="new-password" value={form.confirmacaoSenha} onChange={(e) => setField("confirmacaoSenha", e.target.value)} placeholder="Digite a senha novamente" aria-invalid={!!errors.confirmacaoSenha} />
            </Field>
            <button className={`button buttonPrimary ${styles.submit}`} disabled={loading || !!success} type="submit">{loading ? <><i className={styles.spinner} /> Cadastrando…</> : "Criar minha conta →"}</button>
          </form>
          <p className={styles.loginLink}>Já possui uma conta? <Link to="/login">Acesse aqui</Link></p>
        </div>
      </div>
    </section>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <label className={styles.field}><span>{label}</span>{children}{error && <small role="alert">{error}</small>}</label>;
}
