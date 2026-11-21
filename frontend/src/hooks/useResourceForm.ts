import { type FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { errosDoFormulario, extrairErroApi, type ErrosFormulario } from "../utils/apiErrors";
import { useCrud } from "./useCrud";
import { useFormState } from "./useFormState";

export interface OpcoesFormularioRecurso<TForm extends object, T, TPayload> {
  endpoint: string;
  /** Rota da listagem para onde voltar após salvar. */
  rotaLista: string;
  /** Ausente = criação; presente = edição. */
  id: string | undefined;
  inicial: TForm;
  paraFormulario: (registro: T) => TForm;
  paraPayload: (valores: TForm, registro: T | null) => TPayload;
  /** Validação de campos obrigatórios no cliente, antes de enviar. */
  validar: (valores: TForm) => ErrosFormulario<TForm>;
  mensagens: { criado: string; atualizado: string };
}

/** Fluxo genérico das telas de cadastro/edição: carrega, valida, envia e mostra erros da API. */
export function useResourceForm<TForm extends object, T, TPayload>(opcoes: OpcoesFormularioRecurso<TForm, T, TPayload>) {
  const { endpoint, rotaLista, id, inicial, paraFormulario, paraPayload, validar, mensagens } = opcoes;
  const navigate = useNavigate();
  const crud = useCrud<T, TPayload>(endpoint);
  const form = useFormState<TForm>(inicial);
  const { setValores, setErros } = form;
  const [registro, setRegistro] = useState<T | null>(null);
  const [carregando, setCarregando] = useState(Boolean(id));
  const [erroCarga, setErroCarga] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!id) return;
    let ativo = true;
    setCarregando(true);
    crud
      .buscar(id)
      .then((encontrado) => {
        if (!ativo) return;
        setRegistro(encontrado);
        setValores(paraFormulario(encontrado));
      })
      .catch((error: unknown) => ativo && setErroCarga(extrairErroApi(error, { 404: "Registro não encontrado." }).mensagem))
      .finally(() => ativo && setCarregando(false));
    return () => {
      ativo = false;
    };
    // paraFormulario é estável por tela; recarrega só quando muda o id.
  }, [id, crud, setValores]);

  const enviar = async (event: FormEvent) => {
    event.preventDefault();
    const validacao = validar(form.valores);
    if (Object.keys(validacao).length) {
      setErros(validacao);
      return;
    }
    setSalvando(true);
    try {
      const payload = paraPayload(form.valores, registro);
      if (id) await crud.atualizar(id, payload);
      else await crud.criar(payload);
      navigate(rotaLista, { state: { mensagem: id ? mensagens.atualizado : mensagens.criado } });
    } catch (error) {
      setErros(errosDoFormulario<TForm>(extrairErroApi(error), Object.keys(inicial) as (keyof TForm)[]));
      setSalvando(false);
    }
  };

  return { ...form, registro, carregando, erroCarga, salvando, enviar, editando: Boolean(id) };
}
