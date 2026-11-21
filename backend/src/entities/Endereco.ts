import { Entidade, type DadosEntidade } from "./Entidade.js";
import { erroDeCampo, textoObrigatorio, textoOpcional } from "./validacoes.js";

export const UFS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA",
  "PR", "PB", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"
] as const;

export type UF = (typeof UFS)[number];

const isUF = (valor: string): valor is UF => (UFS as readonly string[]).includes(valor);

export interface EnderecoProps extends DadosEntidade {
  usuarioId: string;
  apelido: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string | null;
  bairro: string;
  cidade: string;
  uf: string;
}

/** O dono (`usuarioId`) nunca vem do cliente: sai do token. */
export type DadosEndereco = Omit<EnderecoProps, keyof DadosEntidade | "usuarioId">;

export interface EnderecoResposta extends Omit<DadosEndereco, "uf"> {
  id: string;
  uf: UF;
  usuarioId: string;
  criadoEm: Date;
  atualizadoEm: Date;
}

export class Endereco extends Entidade<EnderecoResposta> {
  readonly #usuarioId: string;
  #apelido!: string;
  #cep!: string;
  #logradouro!: string;
  #numero!: string;
  #complemento!: string | null;
  #bairro!: string;
  #cidade!: string;
  #uf!: UF;

  constructor(props: EnderecoProps) {
    super(props);
    this.#usuarioId = textoObrigatorio(props.usuarioId, "usuarioId", "Usuário", 1, 191);
    this.atualizar(props);
  }

  get usuarioId(): string { return this.#usuarioId; }
  get apelido(): string { return this.#apelido; }
  get cep(): string { return this.#cep; }
  get uf(): UF { return this.#uf; }
  get cidade(): string { return this.#cidade; }

  pertenceA(usuarioId: string): boolean {
    return this.#usuarioId === usuarioId;
  }

  atualizar(dados: DadosEndereco): void {
    const cep = dados.cep.replace(/\D/g, "");
    if (!/^\d{8}$/.test(cep)) throw erroDeCampo("cep", "O CEP deve ter 8 dígitos.");
    const uf = dados.uf.trim().toUpperCase();
    if (!isUF(uf)) throw erroDeCampo("uf", "Informe uma UF válida.");

    this.#apelido = textoObrigatorio(dados.apelido, "apelido", "Apelido", 2, 60);
    this.#cep = cep;
    this.#logradouro = textoObrigatorio(dados.logradouro, "logradouro", "Logradouro", 2, 150);
    this.#numero = textoObrigatorio(dados.numero, "numero", "Número", 1, 10);
    this.#complemento = textoOpcional(dados.complemento, "complemento", "Complemento", 80);
    this.#bairro = textoObrigatorio(dados.bairro, "bairro", "Bairro", 2, 80);
    this.#cidade = textoObrigatorio(dados.cidade, "cidade", "Cidade", 2, 80);
    this.#uf = uf;
  }

  paraPersistencia(): DadosEndereco & { usuarioId: string } {
    return {
      usuarioId: this.#usuarioId,
      apelido: this.#apelido,
      cep: this.#cep,
      logradouro: this.#logradouro,
      numero: this.#numero,
      complemento: this.#complemento,
      bairro: this.#bairro,
      cidade: this.#cidade,
      uf: this.#uf
    };
  }

  paraResposta(): EnderecoResposta {
    return { ...this.metadados(), ...this.paraPersistencia(), uf: this.#uf };
  }
}
