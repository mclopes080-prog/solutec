import { Link } from "react-router-dom";
import styles from "./SimplePage.module.css";

export function ProdutosPage() {
  return (
    <section className={styles.page}>
      <div className={styles.panel}>
        <span className={styles.tag}>EM CONSTRUÇÃO</span>
        <div className={styles.symbol}>◎</div>
        <h1>Catálogo de produtos</h1>
        <p>O gerenciamento e a exibição completa de produtos serão desenvolvidos nas próximas sprints.</p>
        <Link className="button buttonPrimary" to="/cadastro">Criar uma conta →</Link>
      </div>
    </section>
  );
}
