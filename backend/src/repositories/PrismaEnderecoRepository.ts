import type { Endereco as EnderecoRecord } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { Endereco } from "../entities/Endereco.js";
import type { ParametrosPaginacao } from "../types/paginacao.js";
import { exigirId, skipTake, type Escopo, type Pagina } from "./IRepositorio.js";
import type { IEnderecoRepository } from "./interfaces.js";

const toDomain = (r: EnderecoRecord): Endereco => new Endereco({ ...r });

/** Sempre que houver escopo, o filtro por dono vai junto no WHERE: outro dono = "não existe". */
const porDono = (escopo?: Escopo): { usuarioId?: string } => (escopo ? { usuarioId: escopo.usuarioId } : {});

export class PrismaEnderecoRepository implements IEnderecoRepository {
  async buscarPorId(id: string, escopo?: Escopo): Promise<Endereco | null> {
    const r = await prisma.endereco.findFirst({ where: { id, ...porDono(escopo) } });
    return r ? toDomain(r) : null;
  }

  async listar(paginacao: ParametrosPaginacao, escopo?: Escopo): Promise<Pagina<Endereco>> {
    const where = porDono(escopo);
    const [registros, total] = await prisma.$transaction([
      prisma.endereco.findMany({ where, ...skipTake(paginacao), orderBy: { apelido: "asc" } }),
      prisma.endereco.count({ where })
    ]);
    return { itens: registros.map(toDomain), total };
  }

  async criar(endereco: Endereco): Promise<Endereco> {
    return toDomain(await prisma.endereco.create({ data: endereco.paraPersistencia() }));
  }

  async atualizar(endereco: Endereco): Promise<Endereco> {
    const id = exigirId(endereco.id, "Endereço");
    const { usuarioId: _dono, ...dados } = endereco.paraPersistencia();
    return toDomain(await prisma.endereco.update({ where: { id }, data: dados }));
  }

  async remover(id: string): Promise<void> {
    await prisma.endereco.delete({ where: { id } });
  }

  async possuiPedidos(enderecoId: string): Promise<boolean> {
    return (await prisma.pedido.count({ where: { enderecoId } })) > 0;
  }
}
