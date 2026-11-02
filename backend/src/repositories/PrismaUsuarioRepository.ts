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
    criadoEm: record.criadoEm
  });

export class PrismaUsuarioRepository implements IUsuarioRepository {
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
}
