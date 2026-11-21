import { useEffect, useId, useRef, type ReactNode } from "react";
import { Button } from "./Button";
import styles from "./ConfirmDialog.module.css";

export interface ConfirmDialogProps {
  aberto: boolean;
  titulo: string;
  mensagem: ReactNode;
  textoConfirmar?: string;
  carregando?: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
}

/** Modal de confirmação (usado antes de excluir). Esc ou clique fora cancelam. */
export function ConfirmDialog({ aberto, titulo, mensagem, textoConfirmar = "Excluir", carregando = false, onConfirmar, onCancelar }: ConfirmDialogProps) {
  const idTitulo = useId();
  const idMensagem = useId();
  const cancelarRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!aberto) return;
    cancelarRef.current?.focus();
    const aoTeclar = (event: KeyboardEvent) => event.key === "Escape" && onCancelar();
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [aberto, onCancelar]);

  if (!aberto) return null;

  return (
    <div className={styles.fundo} onClick={onCancelar}>
      <div
        className={styles.caixa}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={idTitulo}
        aria-describedby={idMensagem}
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id={idTitulo}>{titulo}</h2>
        <div id={idMensagem} className={styles.mensagem}>{mensagem}</div>
        <div className={styles.acoes}>
          <Button ref={cancelarRef} variante="light" onClick={onCancelar} disabled={carregando}>Cancelar</Button>
          <Button variante="danger" onClick={onConfirmar} carregando={carregando} textoCarregando="Excluindo…">{textoConfirmar}</Button>
        </div>
      </div>
    </div>
  );
}
