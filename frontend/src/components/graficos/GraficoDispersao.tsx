import { ALTURA, AREA, CORES, LARGURA, escalaLinear, marcas } from "./escala";
import { Eixos } from "./Eixos";
import styles from "./Graficos.module.css";

export interface PontoXY { x: number; y: number; rotulo?: string }
export interface Reta { a: number; b: number }

export interface GraficoDispersaoProps {
  pontos: readonly PontoXY[];
  reta?: Reta;
  rotuloX?: (x: number) => string;
  tituloX?: string;
  tituloY?: string;
  descricao: string;
}

/** Dispersão (x, y) com a reta de regressão ŷ = a + b·x opcional. */
export function GraficoDispersao({ pontos, reta, rotuloX = String, tituloX, tituloY, descricao }: GraficoDispersaoProps) {
  const xs = pontos.map((p) => p.x);
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  const ticks = marcas(Math.max(...pontos.map((p) => p.y)));
  const y = escalaLinear(0, ticks[ticks.length - 1] ?? 1, AREA.y0, AREA.y1);
  const x = escalaLinear(xMin, xMax, AREA.x0 + 24, AREA.x1 - 24);
  return (
    <svg className={styles.svg} viewBox={`0 0 ${LARGURA} ${ALTURA}`} role="img" aria-label={descricao}>
      <Eixos marcasY={ticks} y={y} tituloX={tituloX} tituloY={tituloY} />
      {reta && (
        <line x1={x(xMin)} y1={y(reta.a + reta.b * xMin)} x2={x(xMax)} y2={y(reta.a + reta.b * xMax)} stroke={CORES[3]} strokeWidth={2} strokeDasharray="6 4" />
      )}
      {pontos.map((p) => (
        <g key={p.x}>
          <circle className={styles.ponto} cx={x(p.x)} cy={y(p.y)} r={6} fill={CORES[0]}>
            <title>{`${p.rotulo ?? rotuloX(p.x)}: ${p.y}`}</title>
          </circle>
          <text className={styles.rotulo} x={x(p.x)} y={AREA.y0 + 16} textAnchor="middle">{rotuloX(p.x)}</text>
        </g>
      ))}
    </svg>
  );
}
