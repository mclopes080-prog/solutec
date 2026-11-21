import type { Categoria as CategoriaRecord } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { Categoria } from "../entities/Categoria.js";
import type { ParametrosPaginacao } from "../types/paginacao.js";
import { exigirId, skipTake, type Pagina } from "./IRepositorio.js";
import type { ICategoriaRepository } from "./interfaces.js";

const toDomain = (r: CategoriaRecord): Categoria =>
  new Categoria({ id: r.id, nome: r.nome, descricao: r.descricao, criadoEm: r.criadoEm, atualizadoEm: r.atualizadoEm });

export class PrismaCategoriaRepository implements ICategoriaRepository {
  async buscarPorId(id: string): Promise<Categoria | null> {
    const r = await prisma.categoria.findUnique({ where: { id } });
    return r ? toDomain(r) : null;
  }

  async buscarPorNome(nome: string): Promise<Categoria | null> {
    const r = await prisma.categoria.findUnique({ where: { nome } });
    return r ? toDomain(r) : null;
  }

  async listar(paginacao: ParametrosPaginacao): Promise<Pagina<Categoria>> {
    const [registros, total] = await prisma.$transaction([
      prisma.categoria.findMany({ ...skipTake(paginacao), orderBy: { nome: "asc" } }),
      prisma.categoria.count()
    ]);
    return { itens: registros.map(toDomain), total };
  }

  async criar(categoria: Categoria): Promise<Categoria> {
    return toDomain(await prisma.categoria.create({ data: categoria.paraPersistencia() }));
  }

  async atualizar(categoria: Categoria): Promise<Categoria> {
    const id = exigirId(categoria.id, "Categoria");
    return toDomain(await prisma.categoria.update({ where: { id }, data: categoria.paraPersistencia() }));
  }

  async remover(id: string): Promise<void> {
    await prisma.categoria.delete({ where: { id } });
  }

  contarProdutos(categoriaId: string): Promise<number> {
    return prisma.produto.count({ where: { categoriaId } });
  }
}
