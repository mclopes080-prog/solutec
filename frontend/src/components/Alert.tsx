import type { ReactNode } from "react";
import styles from "./Alert.module.css";

export type TipoAlerta = "erro" | "sucesso" | "info";

export function Alert({ tipo = "info", children }: { tipo?: TipoAlerta; children: ReactNode }) {
  return (
    <div className={`${styles.alert} ${styles[tipo]}`} role={tipo === "erro" ? "alert" : "status"}>
      {children}
    </div>
  );
}
