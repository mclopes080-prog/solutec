import type { ReactNode } from "react";
import styles from "./FormField.module.css";

export interface FormFieldProps {
  label: string;
  error?: string | undefined;
  hint?: ReactNode;
  obrigatorio?: boolean;
  /** Layout em linha (checkbox). */
  inline?: boolean;
  children: ReactNode;
}

/** Rótulo + campo + dica + erro. O <label> envolve o campo, então a associação é implícita. */
export function FormField({ label, error, hint, obrigatorio = false, inline = false, children }: FormFieldProps) {
  return (
    <label className={`${styles.field} ${inline ? styles.inline : ""}`}>
      <span className={styles.label}>
        {label}
        {obrigatorio && <b aria-hidden="true"> *</b>}
      </span>
      {children}
      {hint && <span className={styles.hint}>{hint}</span>}
      {error && <small role="alert">{error}</small>}
    </label>
  );
}
