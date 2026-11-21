import type { Request, Response } from "express";
import type { z } from "zod";
import { usuarioAutenticado } from "../middlewares/autenticar.js";
import type { ContextoRequisicao, IServicoCrud } from "../services/CrudService.js";
import { idParamSchema, paginacaoSchema } from "../validators/comum.validator.js";

export interface MensagensCrud {
  criado: string;
  atualizado: string;
}

/**
 * Controller genérico: só traduz HTTP ⇄ serviço (lê params/query/body, valida com Zod,
 * escolhe o status code). Nenhuma regra de negócio mora aqui (SRP).
 */
export class CrudController<TCriar, TAtualizar, TResposta> {
  constructor(
    private readonly servico: IServicoCrud<TCriar, TAtualizar, TResposta>,
    private readonly schemas: { criar: z.ZodType<TCriar>; atualizar: z.ZodType<TAtualizar> },
    private readonly mensagens: MensagensCrud
  ) {}

  listar = async (request: Request, response: Response): Promise<void> => {
    const paginacao = paginacaoSchema.parse(request.query);
    const resultado = await this.servico.listar(paginacao, this.contexto(request));
    response.status(200).json({ success: true, ...resultado });
  };

  buscar = async (request: Request, response: Response): Promise<void> => {
    const { id } = idParamSchema.parse(request.params);
    const data = await this.servico.buscar(id, this.contexto(request));
    response.status(200).json({ success: true, data });
  };

  criar = async (request: Request, response: Response): Promise<void> => {
    const dados = this.schemas.criar.parse(request.body);
    const data = await this.servico.criar(dados, this.contexto(request));
    response.status(201).json({ success: true, message: this.mensagens.criado, data });
  };

  atualizar = async (request: Request, response: Response): Promise<void> => {
    const { id } = idParamSchema.parse(request.params);
    const dados = this.schemas.atualizar.parse(request.body);
    const data = await this.servico.atualizar(id, dados, this.contexto(request));
    response.status(200).json({ success: true, message: this.mensagens.atualizado, data });
  };

  remover = async (request: Request, response: Response): Promise<void> => {
    const { id } = idParamSchema.parse(request.params);
    await this.servico.remover(id, this.contexto(request));
    response.status(204).end();
  };

  private contexto(request: Request): ContextoRequisicao {
    return { usuarioId: usuarioAutenticado(request) };
  }
}
