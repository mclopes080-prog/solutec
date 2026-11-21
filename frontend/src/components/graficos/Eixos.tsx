import { AREA } from "./escala";
import styles from "./Graficos.module.css";

export interface EixosProps {
  marcasY: readonly number[];
  y: (v: number) => number;
  formatarY?: (v: number) => string;
  tituloY?: string;
  tituloX?: string;
}

/** Eixo Y com linhas de grade + linha de base. Reutilizado por todos os gráficos cartesianos. */
export function Eixos({ marcasY, y, formatarY = String, tituloY, tituloX }: EixosProps) {
  return (
    <g>
      {marcasY.map((m) => (
        <g key={m}>
          <line className={styles.grade} x1={AREA.x0} x2={AREA.x1} y1={y(m)} y2={y(m)} />
          <text className={styles.rotulo} x={AREA.x0 - 8} y={y(m)} textAnchor="end" dominantBaseline="middle">{formatarY(m)}</text>
        </g>
      ))}
      <line className={styles.base} x1={AREA.x0} x2={AREA.x1} y1={AREA.y0} y2={AREA.y0} />
      {tituloY && <text className={styles.titulo} transform={`translate(12 ${(AREA.y0 + AREA.y1) / 2}) rotate(-90)`} textAnchor="middle">{tituloY}</text>}
      {tituloX && <text className={styles.titulo} x={(AREA.x0 + AREA.x1) / 2} y={AREA.y0 + 40} textAnchor="middle">{tituloX}</text>}
    </g>
  );
}
