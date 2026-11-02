import { useLocation } from "react-router-dom";
import styles from "./SimplePage.module.css";

export function LoginPage() {
  const location = useLocation();
  const registered = Boolean((location.state as { cadastroRealizado?: boolean } | null)?.cadastroRealizado);
  return (
    <section className={styles.page}>
      <div className={styles.panel}>
        <span className={styles.tag}>PRÓXIMA SPRINT</span>
        <div className={styles.symbol}>⌁</div>
        <h1>Área de acesso</h1>
        {registered && <p className={styles.notice} role="status">✓ Cadastro concluído. Sua conta está pronta para o futuro login.</p>}
        <p>A autenticação será implementada na próxima etapa do projeto. Nenhum login fictício está ativo.</p>
        <div className={styles.fakeFields} aria-hidden="true"><i /><i /><button disabled>Entrar</button></div>
      </div>
    </section>
  );
}
