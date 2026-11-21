import type { DadosEndereco, EnderecoResposta } from "../entities/Endereco.js";
import type { EnderecoService } from "../services/EnderecoService.js";
import { enderecoSchema } from "../validators/endereco.validator.js";
import { CrudController } from "./CrudController.js";

/** Endereços do usuário logado (o dono vem do token). Herda o fluxo HTTP de CrudController; aqui só entram schemas e mensagens do recurso. */
export class EnderecoController extends CrudController<DadosEndereco, DadosEndereco, EnderecoResposta> {
  constructor(servico: EnderecoService) {
    super(
      servico,
      { criar: enderecoSchema, atualizar: enderecoSchema },
      { criado: "Endereço cadastrado.", atualizado: "Endereço atualizado." }
    );
  }
}
