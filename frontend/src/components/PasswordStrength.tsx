import { getPasswordCriteria } from "../utils/password";
import styles from "./PasswordStrength.module.css";

/** Medidor de força da senha (5 critérios), reutilizado no cadastro e em Minha conta. */
export function PasswordStrength({ senha }: { senha: string }) {
  const criterios = getPasswordCriteria(senha);
  const forca = Object.values(criterios).filter(Boolean).length;
  const rotulo = forca < 3 ? "Senha fraca" : forca < 5 ? "Senha média" : "Senha forte";

  return (
    <div className={styles.wrap}>
      <div className={styles.meter} aria-label={`Força da senha: ${forca} de 5 (${rotulo})`}>
        <div>
          {[1, 2, 3, 4, 5].map((item) => (
            <i key={item} className={item <= forca ? styles.filled : ""} />
          ))}
        </div>
        <span>{rotulo}</span>
      </div>
      <ul className={styles.criteria}>
        {Object.entries(criterios).map(([label, ok]) => (
          <li className={ok ? styles.valid : ""} key={label}>
            {ok ? "✓" : "○"} {label}
          </li>
        ))}
      </ul>
    </div>
  );
}
