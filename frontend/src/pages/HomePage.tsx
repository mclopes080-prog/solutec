import { Link } from "react-router-dom";
import styles from "./HomePage.module.css";

export function HomePage() {
  return (
    <>
      <section className={styles.hero}>
        <div className={`${styles.heroGrid} container`}>
          <div className={styles.copy}>
            <span className={styles.eyebrow}><i /> Tecnologia que protege</span>
            <h1>Segurança conectada.<br /><em>Controle de verdade.</em></h1>
            <p>Uma nova experiência para conhecer soluções de monitoramento e câmeras de segurança com clareza, tecnologia e confiança.</p>
            <div className={styles.actions}>
              <Link className="button buttonPrimary" to="/produtos">Explorar soluções <span>→</span></Link>
              <Link className="button buttonGhost" to="/cadastro">Criar uma conta</Link>
            </div>
            <small>Catálogo demonstrativo • Projeto acadêmico</small>
          </div>
          <div className={styles.visual} aria-label="Ilustração de uma câmera de segurança">
            <div className={styles.orbit} />
            <div className={styles.glow} />
            <div className={styles.camera}>
              <div className={styles.cameraTop} />
              <div className={styles.cameraBody}>
                <div className={styles.lens}><div /><span /></div>
                <b>HD</b>
              </div>
              <div className={styles.cameraArm} />
            </div>
            <div className={`${styles.statusCard} ${styles.statusOne}`}><i /> Sistema conectado<strong>Monitoramento ativo</strong></div>
            <div className={`${styles.statusCard} ${styles.statusTwo}`}><span>◉</span><strong>Visão inteligente</strong>Precisão em cada detalhe</div>
          </div>
        </div>
      </section>

      <section className={styles.features}>
        <div className="container">
          <div className={styles.sectionHeading}>
            <span>Ecossistema Solutec</span>
            <h2>Tecnologia pensada para cada ambiente</h2>
            <p>Conheça as categorias que farão parte da plataforma nas próximas etapas.</p>
          </div>
          <div className={styles.featureGrid}>
            <article><div className={styles.icon}>◎</div><h3>Câmeras de segurança</h3><p>Opções demonstrativas para monitoramento interno e externo.</p><Link to="/produtos">Ver categoria →</Link></article>
            <article><div className={styles.icon}>⌁</div><h3>Monitoramento</h3><p>Estrutura preparada para soluções integradas e conectadas.</p><Link to="/produtos">Conhecer em breve →</Link></article>
            <article><div className={styles.icon}>◇</div><h3>Acessórios</h3><p>Itens complementares organizados para uma futura experiência completa.</p><Link to="/produtos">Explorar estrutura →</Link></article>
          </div>
        </div>
      </section>

      <section className={styles.cta}>
        <div className={`${styles.ctaInner} container`}>
          <div><span>Comece pela sua conta</span><h2>Pronto para conhecer a nova Solutec?</h2></div>
          <Link className="button buttonPrimary" to="/cadastro">Cadastre-se agora <span>→</span></Link>
        </div>
      </section>
    </>
  );
}
