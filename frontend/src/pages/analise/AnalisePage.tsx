import { PageHeader } from "../../components/PageHeader";
import { GraficoBarras } from "../../components/graficos/GraficoBarras";
import { GraficoColunasAgrupadas } from "../../components/graficos/GraficoColunasAgrupadas";
import { GraficoDispersao } from "../../components/graficos/GraficoDispersao";
import { GraficoLinha } from "../../components/graficos/GraficoLinha";
import { Histograma } from "../../components/graficos/Histograma";
import styles from "./AnalisePage.module.css";
import type { ReactNode } from "react";
import { CATEGORIAS, VENDAS, calcularMensal, calcularPorCategoria, mediana, regressaoLinear, type LinhaMensal } from "./dadosAnalise";

const brl = (v: number): string => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const pct = (v: number): string => `${(v * 100).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
const dec = (v: number): string => v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const ABREV: Record<string, string> = { "Câmeras IP": "Câm. IP", "Câmeras analógicas": "Analógicas", Gravadores: "Gravadores", Acessórios: "Acessórios" };

/** Componente exclusivo da página: moldura de um gráfico com tipo, título e interpretação. */
function CartaoGrafico({ tipo, titulo, legenda, children }: { tipo: string; titulo: string; legenda: string; children: ReactNode }) {
  return (
    <figure className={styles.grafico}>
      <span className={styles.tipo}>{tipo}</span>
      <h2>{titulo}</h2>
      {children}
      <figcaption>{legenda}</figcaption>
    </figure>
  );
}

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
  const observacoes = VENDAS.flatMap((v) => CATEGORIAS.map((c) => v.unidades[c]));

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
        <CartaoGrafico tipo="Barras" titulo="Vendas por categoria" legenda={`Câmeras IP lideram com ${pct(categorias[0]?.pctUnidades ?? 0)} das unidades. Apoia a decisão de quanto estocar de cada categoria.`}>
          <GraficoBarras dados={categorias} rotulo={(c) => ABREV[c.categoria] ?? c.categoria} valor={(c) => c.unidades} tituloY="Unidades" descricao="Unidades vendidas por categoria no semestre" />
        </CartaoGrafico>

        <CartaoGrafico tipo="Série temporal" titulo="Evolução mensal das vendas" legenda={`Pico em abril e média de ${dec(totalUnidades / totais.length)} unidades por mês. Mostra os meses de maior procura.`}>
          <GraficoLinha pontos={mensal.map((m) => ({ rotulo: m.mes.slice(0, 3), valor: m.unidades }))} linhaMedia={totalUnidades / totais.length} formatar={(v) => (Number.isInteger(v) ? String(v) : dec(v))} tituloY="Unidades" descricao="Total de unidades vendidas por mês" />
        </CartaoGrafico>

        <CartaoGrafico tipo="Histograma" titulo="Distribuição das vendas por categoria e mês" legenda="Cada observação é uma categoria em um mês (24 no total). A maioria fica entre 2 e 3 unidades: é o volume típico.">
          <Histograma valores={observacoes} tituloX="Unidades vendidas (categoria × mês)" descricao="Frequência de unidades vendidas por categoria em cada mês" />
        </CartaoGrafico>

        <CartaoGrafico tipo="Dispersão + regressão" titulo="Tendência de crescimento" legenda={`ŷ = ${dec(a)} + ${dec(b)}x: cerca de ${dec(b)} unidade a mais por mês. R² = ${dec(r2)}, ou seja, ${pct(r2)} da variação é explicada pela tendência.`}>
          <GraficoDispersao pontos={mensal.map((m, i) => ({ x: i + 1, y: m.unidades, rotulo: m.mes }))} reta={{ a, b }} rotuloX={(x) => mensal[x - 1]?.mes.slice(0, 3) ?? String(x)} tituloX="Mês (x = 1 a 6)" tituloY="Unidades" descricao="Dispersão das vendas mensais com reta de regressão linear" />
        </CartaoGrafico>

        <CartaoGrafico tipo="Colunas agrupadas" titulo="Unidades × receita por categoria" legenda="Gravadores são 19% das unidades, mas quase 40% da receita: não podem faltar no estoque. Acessórios vendem, mas rendem pouco.">
          <GraficoColunasAgrupadas dados={categorias} rotulo={(c) => ABREV[c.categoria] ?? c.categoria} formatar={(v) => `${Math.round(v * 100)}%`} series={[{ nome: "% das unidades", valor: (c) => c.pctUnidades }, { nome: "% da receita", valor: (c) => c.pctReceita }]} descricao="Participação de cada categoria nas unidades e na receita" />
        </CartaoGrafico>
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
