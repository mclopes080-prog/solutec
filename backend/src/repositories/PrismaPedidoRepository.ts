import type { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { ItemPedido } from "../entities/ItemPedido.js";
import { Pedido } from "../entities/Pedido.js";
import type { ParametrosPaginacao } from "../types/paginacao.js";
import { exigirId, skipTake, type Escopo, type Pagina } from "./IRepositorio.js";
import type { IPedidoRepository } from "./interfaces.js";

const include = {
  endereco: { select: { apelido: true } },
  itens: { include: { produto: { select: { nome: true } } }, orderBy: { id: "asc" } }
} satisfies Prisma.PedidoInclude;
type PedidoRecord = Prisma.PedidoGetPayload<{ include: typeof include }>;

const toDomain = (r: PedidoRecord): Pedido =>
  new Pedido({
    id: r.id,
    usuarioId: r.usuarioId,
    enderecoId: r.enderecoId,
    enderecoApelido: r.endereco.apelido,
    status: r.status,
    criadoEm: r.criadoEm,
    atualizadoEm: r.atualizadoEm,
    itens: r.itens.map(
      (item) =>
        new ItemPedido({
          produtoId: item.produtoId,
          produtoNome: item.produto.nome,
          quantidade: item.quantidade,
          precoUnitario: item.precoUnitario.toNumber()
        })
    )
  });

const porDono = (escopo?: Escopo): { usuarioId?: string } => (escopo ? { usuarioId: escopo.usuarioId } : {});

export class PrismaPedidoRepository implements IPedidoRepository {
  async buscarPorId(id: string, escopo?: Escopo): Promise<Pedido | null> {
    const r = await prisma.pedido.findFirst({ where: { id, ...porDono(escopo) }, include });
    return r ? toDomain(r) : null;
  }

  async listar(paginacao: ParametrosPaginacao, escopo?: Escopo): Promise<Pagina<Pedido>> {
    const where = porDono(escopo);
    const [registros, total] = await prisma.$transaction([
      prisma.pedido.findMany({ where, include, ...skipTake(paginacao), orderBy: { criadoEm: "desc" } }),
      prisma.pedido.count({ where })
    ]);
    return { itens: registros.map(toDomain), total };
  }

  async criar(pedido: Pedido): Promise<Pedido> {
    const { itens, ...dados } = pedido.paraPersistencia();
    const r = await prisma.pedido.create({ data: { ...dados, itens: { create: itens } }, include });
    return toDomain(r);
  }

  /** Itens são substituídos por inteiro na mesma operação (atômica no Prisma). */
  async atualizar(pedido: Pedido): Promise<Pedido> {
    const id = exigirId(pedido.id, "Pedido");
    const { itens, enderecoId, status } = pedido.paraPersistencia();
    const r = await prisma.pedido.update({
      where: { id },
      data: { enderecoId, status, itens: { deleteMany: {}, create: itens } },
      include
    });
    return toDomain(r);
  }

  async remover(id: string): Promise<void> {
    await prisma.pedido.delete({ where: { id } });
  }
}
