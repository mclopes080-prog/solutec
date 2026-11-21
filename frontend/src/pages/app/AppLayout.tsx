import { NavLink, Outlet } from "react-router-dom";
import styles from "./AppLayout.module.css";

const ITENS_MENU = [
  { para: "/app", rotulo: "Painel", icone: "◧", fim: true },
  { para: "/app/produtos", rotulo: "Produtos", icone: "◎", fim: false },
  { para: "/app/categorias", rotulo: "Categorias", icone: "▤", fim: false },
  { para: "/app/enderecos", rotulo: "Endereços", icone: "⌂", fim: false },
  { para: "/app/pedidos", rotulo: "Pedidos", icone: "▣", fim: false },
  { para: "/app/conta", rotulo: "Minha conta", icone: "◉", fim: false }
] as const;

/** Casca da área autenticada: menu lateral + conteúdo da rota filha. */
export function AppLayout() {
  return (
    <div className={`${styles.shell} container`}>
      <nav className={styles.menu} aria-label="Menu do painel">
        {ITENS_MENU.map((item) => (
          <NavLink key={item.para} to={item.para} end={item.fim} className={({ isActive }) => `${styles.item} ${isActive ? styles.ativo : ""}`}>
            <span aria-hidden="true">{item.icone}</span>
            {item.rotulo}
          </NavLink>
        ))}
      </nav>
      <div className={styles.conteudo}>
        <Outlet />
      </div>
    </div>
  );
}
