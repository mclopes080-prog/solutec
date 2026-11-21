/** Utilitários compartilhados pelos gráficos (SVG puro, sem biblioteca). */
export const LARGURA = 560;
export const ALTURA = 300;
export const MARGEM = { topo: 20, direita: 20, base: 48, esquerda: 48 } as const;

export const AREA = {
  x0: MARGEM.esquerda,
  x1: LARGURA - MARGEM.direita,
  y0: ALTURA - MARGEM.base,
  y1: MARGEM.topo
} as const;

export const CORES = ["#087fe9", "#12b886", "#f59f00", "#e64980", "#7048e8"] as const;

/** Escala linear: converte um valor do domínio [d0, d1] para pixels [r0, r1]. */
export function escalaLinear(d0: number, d1: number, r0: number, r1: number): (v: number) => number {
  const span = d1 - d0 || 1;
  return (v: number) => r0 + ((v - d0) / span) * (r1 - r0);
}

/** Gera marcas "redondas" de 0 até pelo menos o máximo (cerca de `quantidade` divisões). */
export function marcas(maximo: number, quantidade = 5): number[] {
  const passoBruto = maximo / quantidade;
  const potencia = 10 ** Math.floor(Math.log10(passoBruto || 1));
  const passo = [1, 2, 2.5, 5, 10].map((m) => m * potencia).find((p) => p >= passoBruto) ?? passoBruto;
  const resultado: number[] = [0];
  // Continua até a última marca cobrir o maior valor, para nada sair do gráfico.
  while ((resultado[resultado.length - 1] ?? 0) < maximo) resultado.push(Number(((resultado.length) * passo).toFixed(6)));
  return resultado;
}
