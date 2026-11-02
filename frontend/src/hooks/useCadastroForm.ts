import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import type { ApiErrorResponse, CadastroResponse } from "../types/api";
import { isValidCpf } from "../utils/cpf";
import { getPasswordCriteria } from "../utils/password";

export interface CadastroForm { nome: string; email: string; cpf: string; senha: string; confirmacaoSenha: string }
export type CadastroErrors = Partial<Record<keyof CadastroForm | "form", string>>;

const initialForm: CadastroForm = { nome: "", email: "", cpf: "", senha: "", confirmacaoSenha: "" };

export function useCadastroForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<CadastroErrors>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const setField = (field: keyof CadastroForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined, form: undefined }));
  };

  const validate = (): CadastroErrors => {
    const next: CadastroErrors = {};
    if (form.nome.trim().length < 2) next.nome = "Informe seu nome completo.";
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) next.email = "Informe um e-mail válido.";
    if (!isValidCpf(form.cpf)) next.cpf = "Informe um CPF válido.";
    if (!Object.values(getPasswordCriteria(form.senha)).every(Boolean)) next.senha = "A senha ainda não atende a todos os critérios.";
    if (!form.confirmacaoSenha) next.confirmacaoSenha = "Confirme sua senha.";
    else if (form.senha !== form.confirmacaoSenha) next.confirmacaoSenha = "As senhas não coincidem.";
    return next;
  };

  const submit = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length) { setErrors(validationErrors); return; }
    setLoading(true); setErrors({}); setSuccess("");
    try {
      const { data } = await api.post<CadastroResponse>("/usuarios/cadastro", {
        nome: form.nome.trim(), email: form.email.trim(), cpf: form.cpf, senha: form.senha
      });
      setSuccess(data.message);
      setForm(initialForm);
      window.setTimeout(() => navigate("/login", { state: { cadastroRealizado: true } }), 1400);
    } catch (error) {
      if (axios.isAxiosError<ApiErrorResponse>(error) && error.response?.data?.error) {
        const apiError = error.response.data.error;
        const fieldErrors = Object.fromEntries(
          Object.entries(apiError.fields ?? {}).map(([field, messages]) => [field, messages?.[0]])
        ) as CadastroErrors;
        setErrors({ ...fieldErrors, form: Object.keys(fieldErrors).length ? undefined : apiError.message });
      } else {
        setErrors({ form: "Não foi possível conectar à API. Verifique se o backend está em execução." });
      }
    } finally { setLoading(false); }
  };

  return { form, errors, loading, success, setField, submit };
}
