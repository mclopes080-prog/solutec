import { ALTURA, AREA, CORES, LARGURA, escalaLinear, marcas } from "./escala";
import { Eixos } from "./Eixos";
import styles from "./Graficos.module.css";

export interface GraficoBarrasProps<T> {
  dados: readonly T[];
  rotulo: (item: T) => string;
  valor: (item: T) => number;
  formatar?: (v: number) => string;
  tituloY?: string;
  descricao: string;
}

/** Gráfico de barras genérico: funciona com qualquer tipo T, desde que se diga qual é o rótulo e o valor. */
export function GraficoBarras<T>({ dados, rotulo, valor, formatar = String, tituloY, descricao }: GraficoBarrasProps<T>) {
  const maximo = Math.max(...dados.map(valor));
  const ticks = marcas(maximo);
  const y = escalaLinear(0, ticks[ticks.length - 1] ?? maximo, AREA.y0, AREA.y1);
  const faixa = (AREA.x1 - AREA.x0) / dados.length;
  const largura = faixa * 0.6;
  return (
    <svg className={styles.svg} viewBox={`0 0 ${LARGURA} ${ALTURA}`} role="img" aria-label={descricao}>
      <Eixos marcasY={ticks} y={y} tituloY={tituloY} />
      {dados.map((item, i) => {
        const v = valor(item);
        const x = AREA.x0 + faixa * i + (faixa - largura) / 2;
        return (
          <g key={rotulo(item)}>
            <rect className={styles.barra} x={x} y={y(v)} width={largura} height={AREA.y0 - y(v)} rx={4} fill={CORES[0]}>
              <title>{`${rotulo(item)}: ${formatar(v)}`}</title>
            </rect>
            <text className={styles.valor} x={x + largura / 2} y={y(v) - 6} textAnchor="middle">{formatar(v)}</text>
            <text className={styles.rotulo} x={x + largura / 2} y={AREA.y0 + 16} textAnchor="middle">{rotulo(item)}</text>
          </g>
        );
      })}
    </svg>
  );
}
