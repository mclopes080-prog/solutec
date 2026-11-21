import { ALTURA, AREA, CORES, LARGURA, escalaLinear, marcas } from "./escala";
import { Eixos } from "./Eixos";
import styles from "./Graficos.module.css";

export interface HistogramaProps {
  valores: readonly number[];
  tituloX?: string;
  descricao: string;
}

/** Conta quantas vezes cada valor inteiro aparece (frequência absoluta). */
export function frequencias(valores: readonly number[]): { classe: number; frequencia: number }[] {
  const min = Math.min(...valores);
  const max = Math.max(...valores);
  const resultado: { classe: number; frequencia: number }[] = [];
  for (let c = min; c <= max; c++) resultado.push({ classe: c, frequencia: valores.filter((v) => v === c).length });
  return resultado;
}

/** Histograma: barras encostadas, pois o eixo X é numérico e contínuo (diferente do gráfico de barras). */
export function Histograma({ valores, tituloX, descricao }: HistogramaProps) {
  const classes = frequencias(valores);
  const ticks = marcas(Math.max(...classes.map((c) => c.frequencia)));
  const y = escalaLinear(0, ticks[ticks.length - 1] ?? 1, AREA.y0, AREA.y1);
  const largura = (AREA.x1 - AREA.x0) / classes.length;
  return (
    <svg className={styles.svg} viewBox={`0 0 ${LARGURA} ${ALTURA}`} role="img" aria-label={descricao}>
      <Eixos marcasY={ticks} y={y} tituloY="Frequência" tituloX={tituloX} />
      {classes.map((c, i) => {
        const x = AREA.x0 + largura * i;
        return (
          <g key={c.classe}>
            <rect className={styles.barra} x={x + 1} y={y(c.frequencia)} width={largura - 2} height={AREA.y0 - y(c.frequencia)} fill={CORES[1]}>
              <title>{`${c.classe} unidade(s): ${c.frequencia} observações`}</title>
            </rect>
            <text className={styles.valor} x={x + largura / 2} y={y(c.frequencia) - 6} textAnchor="middle">{c.frequencia}</text>
            <text className={styles.rotulo} x={x + largura / 2} y={AREA.y0 + 16} textAnchor="middle">{c.classe}</text>
          </g>
        );
      })}
    </svg>
  );
}
