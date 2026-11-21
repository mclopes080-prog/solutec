import { type FormEvent, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Alert } from "../components/Alert";
import { Button } from "../components/Button";
import { FormField } from "../components/FormField";
import { useAuth } from "../contexts/AuthContext";
import { useFormState } from "../hooks/useFormState";
import { errosDoFormulario, extrairErroApi, type ErrosFormulario } from "../utils/apiErrors";
import { isValidEmail } from "../utils/email";
import styles from "./Auth.module.css";

interface LoginForm {
  email: string;
  senha: string;
}

interface EstadoNavegacao {
  from?: string;
  cadastroRealizado?: boolean;
  sessaoExpirada?: boolean;
}

const lerEstado = (estado: unknown): EstadoNavegacao =>
  typeof estado === "object" && estado !== null ? (estado as EstadoNavegacao) : {};

function validarLogin(form: LoginForm): ErrosFormulario<LoginForm> {
  const erros: ErrosFormulario<LoginForm> = {};
  if (!isValidEmail(form.email)) erros.email = "Informe um e-mail válido.";
  if (!form.senha) erros.senha = "Informe sua senha.";
  return erros;
}

export function LoginPage() {
  const { login, autenticado } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const estado = lerEstado(location.state);
  const destino = estado.from?.startsWith("/app") ? estado.from : "/app";
  const { valores, erros, setErros, setCampo } = useFormState<LoginForm>({ email: "", senha: "" });
  const [carregando, setCarregando] = useState(false);

  if (autenticado && !carregando) return <Navigate to={destino} replace />;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const validacao = validarLogin(valores);
    if (Object.keys(validacao).length) {
      setErros(validacao);
      return;
    }
    setCarregando(true);
    try {
      await login(valores.email, valores.senha);
      navigate(destino, { replace: true });
    } catch (error) {
      const erro = extrairErroApi(error, { 401: "E-mail ou senha incorretos." });
      setErros(errosDoFormulario<LoginForm>(erro, ["email", "senha"]));
      setCarregando(false);
    }
  };

  return (
    <section className={styles.page}>
      <div className={`${styles.grid} ${styles.gridEstreito} container`}>
        <aside className={styles.intro}>
          <span className={styles.eyebrow}>Área do cliente</span>
          <h1>Bem-vindo<br />de <em>volta.</em></h1>
          <p>Entre para gerenciar o catálogo, seus endereços e acompanhar os pedidos da Solutec.</p>
        </aside>
        <div className={styles.card}>
          <header>
            <span>ACESSO</span>
            <h2>Entrar na conta</h2>
            <p>Use o e-mail e a senha do seu cadastro.</p>
          </header>
          {estado.cadastroRealizado && <Alert tipo="sucesso">✓ Cadastro concluído. Faça login para continuar.</Alert>}
          {estado.sessaoExpirada && !erros.form && <Alert tipo="info">Sua sessão expirou. Entre novamente.</Alert>}
          {erros.form && <Alert tipo="erro">{erros.form}</Alert>}
          <form onSubmit={(e) => void handleSubmit(e)} noValidate>
            <FormField label="E-mail" error={erros.email} obrigatorio>
              <input type="email" autoComplete="email" value={valores.email} onChange={(e) => setCampo("email", e.target.value)} placeholder="voce@exemplo.com" aria-invalid={!!erros.email} autoFocus />
            </FormField>
            <FormField label="Senha" error={erros.senha} obrigatorio>
              <input type="password" autoComplete="current-password" value={valores.senha} onChange={(e) => setCampo("senha", e.target.value)} placeholder="Sua senha" aria-invalid={!!erros.senha} />
            </FormField>
            <Button type="submit" className={styles.submit} carregando={carregando} textoCarregando="Entrando…">
              Entrar →
            </Button>
          </form>
          <p className={styles.rodape}>
            Ainda não tem conta? <Link to="/cadastro">Cadastre-se</Link>
          </p>
        </div>
      </div>
    </section>
  );
}
