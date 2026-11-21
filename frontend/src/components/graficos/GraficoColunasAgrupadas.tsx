import { ALTURA, AREA, CORES, LARGURA, escalaLinear, marcas } from "./escala";
import { Eixos } from "./Eixos";
import styles from "./Graficos.module.css";

export interface Serie<T> { nome: string; valor: (item: T) => number }

export interface GraficoColunasAgrupadasProps<T> {
  dados: readonly T[];
  rotulo: (item: T) => string;
  series: readonly Serie<T>[];
  formatar?: (v: number) => string;
  tituloY?: string;
  descricao: string;
}

/** Colunas agrupadas genéricas: várias séries lado a lado para cada item de T. */
export function GraficoColunasAgrupadas<T>({ dados, rotulo, series, formatar = String, tituloY, descricao }: GraficoColunasAgrupadasProps<T>) {
  const maximo = Math.max(...dados.flatMap((d) => series.map((s) => s.valor(d))));
  const ticks = marcas(maximo);
  const y = escalaLinear(0, ticks[ticks.length - 1] ?? maximo, AREA.y0, AREA.y1);
  const faixa = (AREA.x1 - AREA.x0) / dados.length;
  const largura = (faixa * 0.7) / series.length;
  return (
    <>
      <svg className={styles.svg} viewBox={`0 0 ${LARGURA} ${ALTURA}`} role="img" aria-label={descricao}>
        <Eixos marcasY={ticks} y={y} formatarY={formatar} tituloY={tituloY} />
        {dados.map((item, i) => {
          const inicio = AREA.x0 + faixa * i + faixa * 0.15;
          return (
            <g key={rotulo(item)}>
              {series.map((s, j) => {
                const v = s.valor(item);
                return (
                  <rect key={s.nome} className={styles.barra} x={inicio + largura * j} y={y(v)} width={largura - 2} height={AREA.y0 - y(v)} rx={3} fill={CORES[j % CORES.length]}>
                    <title>{`${rotulo(item)} · ${s.nome}: ${formatar(v)}`}</title>
                  </rect>
                );
              })}
              <text className={styles.rotulo} x={inicio + (largura * series.length) / 2} y={AREA.y0 + 16} textAnchor="middle">{rotulo(item)}</text>
            </g>
          );
        })}
      </svg>
      <div className={styles.legenda}>
        {series.map((s, j) => <span key={s.nome}><i style={{ background: CORES[j % CORES.length] }} />{s.nome}</span>)}
      </div>
    </>
  );
}
