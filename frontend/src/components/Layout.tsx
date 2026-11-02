import { NavLink, Outlet } from "react-router-dom";
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
            <NavLink className={navClass} to="/cadastro">Cadastro</NavLink>
          </nav>
          <NavLink className={styles.login} to="/login">Entrar</NavLink>
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
