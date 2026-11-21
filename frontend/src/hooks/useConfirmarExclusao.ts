import { useState } from "react";
import { extrairErroApi } from "../utils/apiErrors";

/** Estado da exclusão com confirmação: qual item, carregando e erro amigável (ex.: 409). */
export function useConfirmarExclusao<T>(remover: (item: T) => Promise<void>, aoConcluir: () => void) {
  const [alvo, setAlvo] = useState<T | null>(null);
  const [excluindo, setExcluindo] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const confirmar = async () => {
    if (!alvo) return;
    setExcluindo(true);
    setErro("");
    try {
      await remover(alvo);
      setSucesso("Registro excluído.");
      setAlvo(null);
      aoConcluir();
    } catch (error) {
      setErro(extrairErroApi(error).mensagem);
      setAlvo(null);
    } finally {
      setExcluindo(false);
    }
  };

  return {
    alvo,
    excluindo,
    erro,
    sucesso,
    pedir: (item: T) => {
      setErro("");
      setSucesso("");
      setAlvo(item);
    },
    cancelar: () => setAlvo(null),
    confirmar
  };
}
