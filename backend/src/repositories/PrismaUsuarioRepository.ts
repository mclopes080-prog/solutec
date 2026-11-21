import type { Usuario as PrismaUsuario } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { Usuario } from "../entities/Usuario.js";
import type { IUsuarioRepository } from "./IUsuarioRepository.js";

const toDomain = (record: PrismaUsuario): Usuario =>
  new Usuario({
    id: record.id,
    nome: record.nome,
    email: record.email,
    cpf: record.cpf,
    senhaHash: record.senhaHash,
    criadoEm: record.criadoEm,
    atualizadoEm: record.atualizadoEm
  });

export class PrismaUsuarioRepository implements IUsuarioRepository {
  async buscarPorId(id: string): Promise<Usuario | null> {
    const record = await prisma.usuario.findUnique({ where: { id } });
    return record ? toDomain(record) : null;
  }

  async buscarPorEmail(email: string): Promise<Usuario | null> {
    const record = await prisma.usuario.findUnique({ where: { email } });
    return record ? toDomain(record) : null;
  }

  async buscarPorCpf(cpf: string): Promise<Usuario | null> {
    const record = await prisma.usuario.findUnique({ where: { cpf } });
    return record ? toDomain(record) : null;
  }

  async criar(usuario: Usuario): Promise<Usuario> {
    const record = await prisma.usuario.create({ data: usuario.paraPersistencia() });
    return toDomain(record);
  }

  async atualizar(usuario: Usuario): Promise<Usuario> {
    if (!usuario.id) throw new Error("Usuário sem id não pode ser atualizado.");
    // O e-mail nunca é enviado no update: ele é imutável depois do cadastro.
    const { nome, cpf, senhaHash } = usuario.paraPersistencia();
    const record = await prisma.usuario.update({ where: { id: usuario.id }, data: { nome, cpf, senhaHash } });
    return toDomain(record);
  }
}
