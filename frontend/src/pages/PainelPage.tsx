import { Link } from "react-router-dom";
import { PageHeader } from "../components/PageHeader";
import { useAuth } from "../contexts/AuthContext";
import styles from "./PainelPage.module.css";

const ATALHOS = [
  { para: "/app/produtos", titulo: "Produtos", texto: "Preço, estoque, foto e status de cada item do catálogo.", icone: "◎" },
  { para: "/app/categorias", titulo: "Categorias", texto: "Organize câmeras, alarmes, controle de acesso e monitoramento.", icone: "▤" },
  { para: "/app/enderecos", titulo: "Endereços", texto: "Locais de instalação e entrega cadastrados na sua conta.", icone: "⌂" },
  { para: "/app/pedidos", titulo: "Pedidos", texto: "Crie pedidos e acompanhe o status: pendente, pago, enviado.", icone: "▣" }
] as const;

export function PainelPage() {
  const { usuario } = useAuth();
  const primeiroNome = usuario?.nome.split(" ")[0] ?? "";
  return (
    <>
      <PageHeader sobretitulo="Painel" titulo={`Olá, ${primeiroNome}!`} descricao="Escolha uma área para gerenciar." />
      <div className={styles.grid}>
        {ATALHOS.map((atalho) => (
          <Link key={atalho.para} to={atalho.para} className={styles.card}>
            <span className={styles.icone} aria-hidden="true">{atalho.icone}</span>
            <strong>{atalho.titulo}</strong>
            <p>{atalho.texto}</p>
            <em>Abrir →</em>
          </Link>
        ))}
      </div>
    </>
  );
}
