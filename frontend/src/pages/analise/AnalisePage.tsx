import { PageHeader } from "../../components/PageHeader";
import styles from "./AnalisePage.module.css";
import { VENDAS, calcularMensal, calcularPorCategoria, mediana, regressaoLinear, type LinhaMensal } from "./dadosAnalise";

const brl = (v: number): string => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const pct = (v: number): string => `${(v * 100).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
const dec = (v: number): string => v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

interface Grafico { arquivo: string; tipo: string; titulo: string; legenda: string }

const GRAFICOS: readonly Grafico[] = [
  { arquivo: "grafico-vendas-categoria.svg", tipo: "Barras", titulo: "Vendas por categoria", legenda: "Câmeras IP lideram em unidades (38,1%). Apoia a decisão de quanto estocar de cada categoria." },
  { arquivo: "grafico-evolucao-mensal.svg", tipo: "Série temporal", titulo: "Evolução mensal das vendas", legenda: "Totais de 8 a 13 unidades por mês, com pico em abril. Mostra os meses de maior procura." },
  { arquivo: "grafico-histograma-vendas.svg", tipo: "Histograma", titulo: "Distribuição das vendas por categoria e mês", legenda: "16 das 24 observações ficam entre 2 e 3 unidades: é o volume típico de cada categoria por mês." },
  { arquivo: "grafico-dispersao-regressao.svg", tipo: "Dispersão + regressão", titulo: "Tendência de crescimento", legenda: "A reta de regressão indica a tendência das vendas ao longo do semestre." },
  { arquivo: "grafico-receita-categoria.svg", tipo: "Colunas agrupadas", titulo: "Unidades × receita por categoria", legenda: "Gravadores são 19% das unidades, mas quase 40% da receita: não podem faltar no estoque." }
];

/** Componente exclusivo da página: um indicador. */
function Indicador({ rotulo, valor, detalhe }: { rotulo: string; valor: string; detalhe: string }) {
  return (
    <div className={styles.kpi}>
      <span>{rotulo}</span>
      <strong>{valor}</strong>
      <small>{detalhe}</small>
    </div>
  );
}

/** Componente exclusivo da página: célula de variação colorida. */
function Variacao({ linha }: { linha: LinhaMensal }) {
  if (linha.variacao === null) return <td className={styles.num}>—</td>;
  const classe = linha.variacao >= 0 ? styles.positivo : styles.negativo;
  return <td className={`${styles.num} ${classe}`}>{linha.variacao >= 0 ? "+" : ""}{pct(linha.variacao)}</td>;
}

export function AnalisePage() {
  const mensal = calcularMensal(VENDAS);
  const categorias = calcularPorCategoria(VENDAS);
  const totais = mensal.map((m) => m.unidades);
  const totalUnidades = totais.reduce((a, b) => a + b, 0);
  const receitaTotal = mensal.reduce((a, m) => a + m.receita, 0);
  const { a, b, r2 } = regressaoLinear(totais);

  return (
    <>
      <PageHeader sobretitulo="Probabilidade e Estatística" titulo="Análise de vendas" descricao="Gráficos e métricas para apoiar as decisões de estoque, promoção e mix da Solutec." />
      <p className={styles.aviso}>Dados 100% fictícios, criados apenas para demonstrar os conceitos. Não representam vendas reais da Solutec.</p>

      <div className={styles.kpis}>
        <Indicador rotulo="Unidades no semestre" valor={String(totalUnidades)} detalhe={`média ${dec(totalUnidades / totais.length)} · mediana ${dec(mediana(totais))}`} />
        <Indicador rotulo="Receita estimada" valor={brl(receitaTotal)} detalhe="unidades × preço médio" />
        <Indicador rotulo="Ticket médio" valor={brl(receitaTotal / totalUnidades)} detalhe="receita ÷ unidades" />
        <Indicador rotulo="Regressão linear" valor={`ŷ = ${dec(a)} + ${dec(b)}x`} detalhe={`R² = ${dec(r2)}`} />
      </div>

      <div className={styles.graficos}>
        {GRAFICOS.map((g) => (
          <figure key={g.arquivo} className={styles.grafico}>
            <span className={styles.tipo}>{g.tipo}</span>
            <h2>{g.titulo}</h2>
            <img src={`/analise/${g.arquivo}`} alt={g.titulo} loading="lazy" />
            <figcaption>{g.legenda}</figcaption>
          </figure>
        ))}
      </div>

      <h2 className={styles.secao}>Receita por categoria</h2>
      <table className={styles.tabela}>
        <thead><tr><th>Categoria</th><th className={styles.num}>Unidades</th><th className={styles.num}>Receita</th><th className={styles.num}>% unidades</th><th className={styles.num}>% receita</th></tr></thead>
        <tbody>
          {categorias.map((c) => (
            <tr key={c.categoria}><td>{c.categoria}</td><td className={styles.num}>{c.unidades}</td><td className={styles.num}>{brl(c.receita)}</td><td className={styles.num}>{pct(c.pctUnidades)}</td><td className={styles.num}>{pct(c.pctReceita)}</td></tr>
          ))}
        </tbody>
      </table>

      <h2 className={styles.secao}>Receita, ticket médio e variação mês a mês</h2>
      <table className={styles.tabela}>
        <thead><tr><th>Mês</th><th className={styles.num}>Unidades</th><th className={styles.num}>Receita</th><th className={styles.num}>Ticket médio</th><th className={styles.num}>Variação</th></tr></thead>
        <tbody>
          {mensal.map((m) => (
            <tr key={m.mes}><td>{m.mes}</td><td className={styles.num}>{m.unidades}</td><td className={styles.num}>{brl(m.receita)}</td><td className={styles.num}>{brl(m.ticket)}</td><Variacao linha={m} /></tr>
          ))}
        </tbody>
      </table>

      <h2 className={styles.secao}>Da métrica à decisão</h2>
      <table className={styles.tabela}>
        <thead><tr><th>Métrica</th><th>O que mostra</th><th>Decisão</th></tr></thead>
        <tbody>
          <tr><td>Receita por categoria</td><td>Gravadores: 19% das unidades, 39,9% da receita.</td><td>Estoque mínimo maior e reposição antecipada de gravadores.</td></tr>
          <tr><td>Participação na receita</td><td>Acessórios: 14,3% das unidades, só 4,1% da receita.</td><td>Vender acessórios em kits com câmeras, sem desconto avulso.</td></tr>
          <tr><td>Unidades × receita</td><td>Analógicas vendem bem, mas rendem menos.</td><td>Destacar câmeras IP no catálogo; analógicas como entrada de preço.</td></tr>
          <tr><td>Ticket médio</td><td>Caiu de R$ 338,75 para cerca de R$ 300.</td><td>Oferecer upgrade: analógica → IP, câmera → kit com DVR.</td></tr>
          <tr><td>Variação mês a mês</td><td>Maior pico em abril (+31,5%).</td><td>Reforçar estoque de câmeras IP e gravadores antes de abril.</td></tr>
        </tbody>
      </table>
    </>
  );
}
