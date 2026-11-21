import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Brand } from "./Brand";
import styles from "./Layout.module.css";

export function Layout() {
  const navClass = ({ isActive }: { isActive: boolean }) => `${styles.navLink} ${isActive ? styles.active : ""}`;
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={`${styles.headerInner} container`}>
          <Brand />
          <nav className={styles.nav} aria-label="Navegação principal">
            <NavLink className={navClass} to="/" end>Início</NavLink>
            <NavLink className={navClass} to="/produtos">Produtos</NavLink>
            <NavLink className={navClass} to="/app">Painel</NavLink>
          </nav>
          <AreaUsuario />
        </div>
      </header>
      <main className={styles.main}><Outlet /></main>
      <footer className={styles.footer}>
        <div className="container">
          <div className={styles.footerTop}>
            <Brand />
            <p>Soluções tecnológicas e segurança eletrônica.</p>
          </div>
          <div className={styles.footerBottom}>
            <span>© 2026 Solutec. Projeto acadêmico demonstrativo.</span>
            <span>Peabiru, Paraná</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

/** Canto direito do cabeçalho: nome do usuário logado (vem do AuthContext) ou botões de acesso. */
function AreaUsuario() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  if (!usuario) {
    return (
      <div className={styles.userArea}>
        <NavLink className={styles.secondary} to="/cadastro">Cadastro</NavLink>
        <NavLink className={styles.login} to="/login">Entrar</NavLink>
      </div>
    );
  }

  const sair = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className={styles.userArea}>
      <Link className={styles.userName} to="/app/conta" title="Minha conta">
        <span aria-hidden="true">{usuario.nome.charAt(0).toUpperCase()}</span>
        Olá, {usuario.nome.split(" ")[0]}
      </Link>
      <button type="button" className={styles.login} onClick={sair}>Sair</button>
    </div>
  );
}
