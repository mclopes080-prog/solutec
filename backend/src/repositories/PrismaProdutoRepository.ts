import type { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { Produto } from "../entities/Produto.js";
import type { ParametrosPaginacao } from "../types/paginacao.js";
import { exigirId, skipTake, type Pagina } from "./IRepositorio.js";
import type { IProdutoRepository } from "./interfaces.js";

const include = { categoria: { select: { nome: true } } } satisfies Prisma.ProdutoInclude;
type ProdutoRecord = Prisma.ProdutoGetPayload<{ include: typeof include }>;

const toDomain = (r: ProdutoRecord): Produto =>
  new Produto({
    id: r.id,
    nome: r.nome,
    descricao: r.descricao,
    preco: r.preco.toNumber(),
    estoque: r.estoque,
    imagemUrl: r.imagemUrl,
    ativo: r.ativo,
    categoriaId: r.categoriaId,
    categoriaNome: r.categoria.nome,
    criadoEm: r.criadoEm,
    atualizadoEm: r.atualizadoEm
  });

export class PrismaProdutoRepository implements IProdutoRepository {
  async buscarPorId(id: string): Promise<Produto | null> {
    const r = await prisma.produto.findUnique({ where: { id }, include });
    return r ? toDomain(r) : null;
  }

  async buscarPorIds(ids: readonly string[]): Promise<Produto[]> {
    const registros = await prisma.produto.findMany({ where: { id: { in: [...ids] } }, include });
    return registros.map(toDomain);
  }

  listar(paginacao: ParametrosPaginacao): Promise<Pagina<Produto>> {
    return this.#paginar(paginacao, {});
  }

  listarAtivos(paginacao: ParametrosPaginacao): Promise<Pagina<Produto>> {
    return this.#paginar(paginacao, { ativo: true });
  }

  async #paginar(paginacao: ParametrosPaginacao, where: Prisma.ProdutoWhereInput): Promise<Pagina<Produto>> {
    const [registros, total] = await prisma.$transaction([
      prisma.produto.findMany({ where, include, ...skipTake(paginacao), orderBy: { nome: "asc" } }),
      prisma.produto.count({ where })
    ]);
    return { itens: registros.map(toDomain), total };
  }

  async criar(produto: Produto): Promise<Produto> {
    return toDomain(await prisma.produto.create({ data: produto.paraPersistencia(), include }));
  }

  async atualizar(produto: Produto): Promise<Produto> {
    const id = exigirId(produto.id, "Produto");
    return toDomain(await prisma.produto.update({ where: { id }, data: produto.paraPersistencia(), include }));
  }

  async remover(id: string): Promise<void> {
    await prisma.produto.delete({ where: { id } });
  }

  async possuiPedidos(produtoId: string): Promise<boolean> {
    return (await prisma.itemPedido.count({ where: { produtoId } })) > 0;
  }
}
