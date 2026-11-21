import { useCallback, useState } from "react";
import type { ErrosFormulario } from "../utils/apiErrors";

/** Estado genérico de formulário: valores tipados por campo + erros por campo/geral. */
export function useFormState<T extends object>(inicial: T) {
  const [valores, setValores] = useState<T>(inicial);
  const [erros, setErros] = useState<ErrosFormulario<T>>({});

  const setCampo = useCallback(<K extends keyof T>(campo: K, valor: T[K]) => {
    setValores((atual) => ({ ...atual, [campo]: valor }));
    setErros((atual) => ({ ...atual, [campo]: undefined, form: undefined }));
  }, []);

  return { valores, setValores, erros, setErros, setCampo };
}
