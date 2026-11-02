import { Link } from "react-router-dom";
import styles from "./Brand.module.css";

export function Brand() {
  return (
    <Link className={styles.brand} to="/" aria-label="Solutec — página inicial">
      <span className={styles.mark} aria-hidden="true">
        <svg viewBox="0 0 30 30" fill="none">
          <path d="M15 2.5 26 6.7v7.5c0 6.7-4.5 11.2-11 13.3C8.5 25.4 4 20.9 4 14.2V6.7L15 2.5Z" />
          <circle cx="15" cy="14" r="4" />
          <path d="M15 10V7.5M15 20.5V18M11 14H8.5M21.5 14H19" />
        </svg>
      </span>
      <span>solu<strong>tec</strong></span>
    </Link>
  );
}
