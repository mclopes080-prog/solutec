import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFormState } from "./useFormState";
import { api } from "../services/api";
import type { CadastroResponse } from "../types/api";
import { errosDoFormulario, extrairErroApi, type ErrosFormulario } from "../utils/apiErrors";
import { isValidCpf } from "../utils/cpf";
import { isValidEmail } from "../utils/email";
import { isStrongPassword } from "../utils/password";

export interface CadastroForm {
  nome: string;
  email: string;
  cpf: string;
  senha: string;
  confirmacaoSenha: string;
}

const inicial: CadastroForm = { nome: "", email: "", cpf: "", senha: "", confirmacaoSenha: "" };
const CAMPOS = Object.keys(inicial) as (keyof CadastroForm)[];

export function validarCadastro(form: CadastroForm): ErrosFormulario<CadastroForm> {
  const erros: ErrosFormulario<CadastroForm> = {};
  if (form.nome.trim().length < 2) erros.nome = "Informe seu nome completo.";
  if (!isValidEmail(form.email)) erros.email = "Informe um e-mail válido.";
  if (!isValidCpf(form.cpf)) erros.cpf = "Informe um CPF válido.";
  if (!isStrongPassword(form.senha)) erros.senha = "A senha ainda não atende a todos os critérios.";
  if (!form.confirmacaoSenha) erros.confirmacaoSenha = "Confirme sua senha.";
  else if (form.senha !== form.confirmacaoSenha) erros.confirmacaoSenha = "As senhas não coincidem.";
  return erros;
}

export function useCadastroForm() {
  const navigate = useNavigate();
  const { valores: form, erros, setErros, setCampo, setValores } = useFormState(inicial);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const submit = async () => {
    const validacao = validarCadastro(form);
    if (Object.keys(validacao).length) {
      setErros(validacao);
      return;
    }
    setLoading(true);
    setErros({});
    setSuccess("");
    try {
      // A confirmação é verificada no cliente; a API recebe só a senha.
      const { data } = await api.post<CadastroResponse>("/usuarios/cadastro", {
        nome: form.nome.trim(),
        email: form.email.trim(),
        cpf: form.cpf,
        senha: form.senha
      });
      setSuccess(data.message ?? "Cadastro realizado com sucesso.");
      setValores(inicial);
      window.setTimeout(() => navigate("/login", { state: { cadastroRealizado: true } }), 1400);
    } catch (error) {
      setErros(errosDoFormulario<CadastroForm>(extrairErroApi(error), CAMPOS));
    } finally {
      setLoading(false);
    }
  };

  return { form, errors: erros, loading, success, setField: setCampo, submit };
}
