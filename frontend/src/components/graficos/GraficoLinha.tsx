import { ALTURA, AREA, CORES, LARGURA, escalaLinear, marcas } from "./escala";
import { Eixos } from "./Eixos";
import styles from "./Graficos.module.css";

export interface PontoSerie { rotulo: string; valor: number }

export interface GraficoLinhaProps {
  pontos: readonly PontoSerie[];
  formatar?: (v: number) => string;
  tituloY?: string;
  linhaMedia?: number;
  descricao: string;
}

/** Série temporal: um ponto por período, ligados por linha. Opcionalmente desenha a média. */
export function GraficoLinha({ pontos, formatar = String, tituloY, linhaMedia, descricao }: GraficoLinhaProps) {
  const maximo = Math.max(...pontos.map((p) => p.valor));
  const ticks = marcas(maximo);
  const y = escalaLinear(0, ticks[ticks.length - 1] ?? maximo, AREA.y0, AREA.y1);
  const x = escalaLinear(0, pontos.length - 1, AREA.x0 + 24, AREA.x1 - 24);
  const caminho = pontos.map((p, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(p.valor)}`).join(" ");
  return (
    <svg className={styles.svg} viewBox={`0 0 ${LARGURA} ${ALTURA}`} role="img" aria-label={descricao}>
      <Eixos marcasY={ticks} y={y} tituloY={tituloY} />
      {linhaMedia !== undefined && (
        <g>
          <line x1={AREA.x0} x2={AREA.x1} y1={y(linhaMedia)} y2={y(linhaMedia)} stroke={CORES[2]} strokeDasharray="5 4" />
          <text className={styles.rotulo} x={AREA.x1} y={y(linhaMedia) - 6} textAnchor="end">média {formatar(linhaMedia)}</text>
        </g>
      )}
      <path d={caminho} fill="none" stroke={CORES[0]} strokeWidth={2.5} />
      {pontos.map((p, i) => (
        <g key={p.rotulo}>
          <circle className={styles.ponto} cx={x(i)} cy={y(p.valor)} r={5} fill="#fff" stroke={CORES[0]} strokeWidth={2.5}>
            <title>{`${p.rotulo}: ${formatar(p.valor)}`}</title>
          </circle>
          <text className={styles.valor} x={x(i)} y={y(p.valor) - 10} textAnchor="middle">{formatar(p.valor)}</text>
          <text className={styles.rotulo} x={x(i)} y={AREA.y0 + 16} textAnchor="middle">{p.rotulo}</text>
        </g>
      ))}
    </svg>
  );
}
