/** Dados 100% fictícios, os mesmos de docs/dados-simulados.csv e docs/analise-estatistica.md. */
export type Categoria = "Câmeras IP" | "Câmeras analógicas" | "Gravadores" | "Acessórios";

export interface VendaMensal {
  mes: string;
  unidades: Record<Categoria, number>;
}

export const PRECO_MEDIO: Record<Categoria, number> = {
  "Câmeras IP": 320,
  "Câmeras analógicas": 180,
  Gravadores: 650,
  Acessórios: 90
};

export const VENDAS: readonly VendaMensal[] = [
  { mes: "Janeiro", unidades: { "Câmeras IP": 3, "Câmeras analógicas": 2, Gravadores: 2, Acessórios: 1 } },
  { mes: "Fevereiro", unidades: { "Câmeras IP": 4, "Câmeras analógicas": 3, Gravadores: 2, Acessórios: 1 } },
  { mes: "Março", unidades: { "Câmeras IP": 3, "Câmeras analógicas": 3, Gravadores: 2, Acessórios: 1 } },
  { mes: "Abril", unidades: { "Câmeras IP": 5, "Câmeras analógicas": 4, Gravadores: 2, Acessórios: 2 } },
  { mes: "Maio", unidades: { "Câmeras IP": 4, "Câmeras analógicas": 3, Gravadores: 2, Acessórios: 2 } },
  { mes: "Junho", unidades: { "Câmeras IP": 5, "Câmeras analógicas": 3, Gravadores: 2, Acessórios: 2 } }
];

export const CATEGORIAS = Object.keys(PRECO_MEDIO) as Categoria[];

export interface LinhaMensal { mes: string; unidades: number; receita: number; ticket: number; variacao: number | null }
export interface LinhaCategoria { categoria: Categoria; unidades: number; receita: number; pctUnidades: number; pctReceita: number }

const somar = (valores: readonly number[]): number => valores.reduce((a, b) => a + b, 0);

export function calcularMensal(vendas: readonly VendaMensal[]): LinhaMensal[] {
  return vendas.map((venda, i) => {
    const unidades = somar(CATEGORIAS.map((c) => venda.unidades[c]));
    const receita = somar(CATEGORIAS.map((c) => venda.unidades[c] * PRECO_MEDIO[c]));
    const anterior = i > 0 ? somar(CATEGORIAS.map((c) => (vendas[i - 1]?.unidades[c] ?? 0) * PRECO_MEDIO[c])) : null;
    return { mes: venda.mes, unidades, receita, ticket: receita / unidades, variacao: anterior ? (receita - anterior) / anterior : null };
  });
}

export function calcularPorCategoria(vendas: readonly VendaMensal[]): LinhaCategoria[] {
  const unidades = CATEGORIAS.map((c) => somar(vendas.map((v) => v.unidades[c])));
  const totalUnidades = somar(unidades);
  const receitas = CATEGORIAS.map((c, i) => (unidades[i] ?? 0) * PRECO_MEDIO[c]);
  const totalReceita = somar(receitas);
  return CATEGORIAS.map((categoria, i) => ({
    categoria,
    unidades: unidades[i] ?? 0,
    receita: receitas[i] ?? 0,
    pctUnidades: (unidades[i] ?? 0) / totalUnidades,
    pctReceita: (receitas[i] ?? 0) / totalReceita
  }));
}

export function mediana(valores: readonly number[]): number {
  const o = [...valores].sort((a, b) => a - b);
  const m = Math.floor(o.length / 2);
  return o.length % 2 === 0 ? ((o[m - 1] ?? 0) + (o[m] ?? 0)) / 2 : (o[m] ?? 0);
}

/** Regressão linear simples (mínimos quadrados) com x = 1..n. */
export function regressaoLinear(y: readonly number[]): { a: number; b: number; r2: number } {
  const n = y.length;
  const x = y.map((_, i) => i + 1);
  const mx = somar(x) / n;
  const my = somar(y) / n;
  const sxy = somar(x.map((xi, i) => (xi - mx) * ((y[i] ?? 0) - my)));
  const sxx = somar(x.map((xi) => (xi - mx) ** 2));
  const b = sxy / sxx;
  const a = my - b * mx;
  const sqTot = somar(y.map((yi) => (yi - my) ** 2));
  const sqRes = somar(y.map((yi, i) => (yi - (a + b * (x[i] ?? 0))) ** 2));
  return { a, b, r2: 1 - sqRes / sqTot };
}
